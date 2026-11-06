from datetime import datetime, time, timedelta

from models.task_assignment_model import TaskAssignmentModel
from repositories.base_repository import BaseRepository
from utils.dates import now_local


class TaskAssignmentRepository(BaseRepository):
    """Consultas sobre as tarefas de cada criança: filtros, travas e relatório mensal.

    "Atrasada" é calculada aqui: status pending com o prazo antes de agora.
    """

    _SELECT_BASE = """
        SELECT
            t.id AS task_id,
            ta.id AS assignment_id,
            ta.child_profile_id,
            t.name,
            t.deadline,
            t.coins_reward,
            t.required_proof,
            t.xp_reward,
            ta.status,
            (ta.status = 'pending' AND t.deadline < :now) AS is_late,
            ta.completion_date,
            ta.proof_photo
        FROM tasks AS t
        JOIN task_assignments AS ta ON ta.task_id = t.id
    """

    # ---------- listagem com filtros (painel de tarefas) ----------
    @staticmethod
    def _filters(family_account_id, status=None, child_profile_id=None, from_tomorrow=False):
        now = now_local()
        today_start = datetime.combine(now.date(), time.min)
        tomorrow_start = today_start + timedelta(days=1)

        where = " WHERE t.family_account_id = :family_account_id"
        params = {"family_account_id": family_account_id}

        if status == TaskAssignmentModel.LATE:
            where += " AND ta.status = 'pending' AND t.deadline < :late_before"
            params["late_before"] = now
        elif status:
            where += " AND ta.status = :status"
            params["status"] = status

        if from_tomorrow:
            where += " AND t.deadline >= :tomorrow_start"
            params["tomorrow_start"] = tomorrow_start
        elif status != TaskAssignmentModel.AWAITING_APPROVAL:
            # sem período: só as de hoje (as aguardando aprovação aparecem sempre)
            where += " AND t.deadline >= :today_start AND t.deadline < :tomorrow_start"
            params.update(today_start=today_start, tomorrow_start=tomorrow_start)

        if child_profile_id:
            where += " AND ta.child_profile_id = :child_profile_id"
            params["child_profile_id"] = child_profile_id

        return where, params

    def list_with_status(self, family_account_id, status=None, child_profile_id=None,
                         from_tomorrow=False, page=1, size=6):
        where, params = self._filters(family_account_id, status, child_profile_id, from_tomorrow)
        sql = self._SELECT_BASE + where + " ORDER BY t.deadline ASC, ta.id ASC LIMIT :limit OFFSET :offset"
        params.update(now=now_local(), limit=size, offset=(page - 1) * size)
        return self._buscar_varios(sql, params)

    def count_with_status(self, family_account_id, status=None, child_profile_id=None,
                          from_tomorrow=False):
        where, params = self._filters(family_account_id, status, child_profile_id, from_tomorrow)
        return self._buscar_valor(
            "SELECT COUNT(*) AS total FROM tasks AS t "
            "JOIN task_assignments AS ta ON ta.task_id = t.id" + where,
            params,
        )

    # ---------- uma tarefa de uma criança ----------
    def find_detail(self, assignment_id):
        return self._buscar_um(
            self._SELECT_BASE + " WHERE ta.id = :assignment_id",
            {"now": now_local(), "assignment_id": assignment_id},
        )

    def find_for_update(self, assignment_id, family_account_id):
        """Trava a linha da tarefa da criança até o commit (evita aprovar duas vezes)."""
        return self._buscar_um("""
            SELECT
                ta.id AS assignment_id,
                ta.task_id,
                ta.child_profile_id,
                ta.status,
                ta.proof_photo,
                t.name,
                t.coins_reward,
                t.xp_reward,
                t.required_proof
            FROM task_assignments AS ta
            JOIN tasks AS t ON t.id = ta.task_id
            WHERE ta.id = :assignment_id AND t.family_account_id = :family_account_id
        """ + self._for_update, {"assignment_id": assignment_id, "family_account_id": family_account_id})

    def find_child_assignment(self, assignment_id, child_profile_id, family_account_id):
        row = self._buscar_um("""
            SELECT
                t.id AS task_id,
                ta.id AS assignment_id,
                ta.child_profile_id,
                t.name,
                t.description,
                t.deadline,
                t.coins_reward,
                t.xp_reward,
                t.required_proof,
                ta.status,
                ta.submitted_at,
                ta.completion_date,
                ta.proof_photo,
                p.name AS child_name
            FROM task_assignments AS ta
            JOIN tasks AS t ON ta.task_id = t.id
            JOIN profiles AS p ON ta.child_profile_id = p.id
            WHERE ta.id = :assignment_id
              AND t.family_account_id = :family_account_id
              AND ta.child_profile_id = :child_profile_id
        """, {
            "assignment_id": assignment_id,
            "family_account_id": family_account_id,
            "child_profile_id": child_profile_id,
        })
        if row is None:
            return None

        return {
            "id": row["task_id"],
            "assignment_id": row["assignment_id"],
            "child_profile_id": row["child_profile_id"],
            "name": row["name"],
            "description": row["description"],
            "deadline": row["deadline"],
            "coins_reward": row["coins_reward"],
            "xp_reward": row["xp_reward"],
            "required_proof": bool(row["required_proof"]),
            "status": row["status"],
            "submitted_at": row["submitted_at"],
            "completion_date": row["completion_date"],
            "proof_photo": row["proof_photo"],
            "child_name": row["child_name"],
        }

    def list_by_task(self, task_id):
        """Crianças de uma tarefa, com o status de cada uma (usado ao editar a tarefa)."""
        return self._buscar_varios("""
            SELECT
                ta.id AS assignment_id,
                ta.child_profile_id,
                ta.status,
                p.name AS child_name
            FROM task_assignments AS ta
            JOIN profiles AS p ON p.id = ta.child_profile_id
            WHERE ta.task_id = :task_id
        """, {"task_id": task_id})

    # ---------- relatório ----------
    def monthly_report(self, family_account_id, child_profile_id, start, end):
        """Totais do mês por criança: feitas no prazo, com atraso e não feitas."""
        return self._buscar_um("""
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(ta.status = 'done'), 0) AS done_total,
                COALESCE(SUM(
                    ta.status = 'done'
                    AND COALESCE(ta.submitted_at, ta.completion_date) > t.deadline
                ), 0) AS done_late,
                COALESCE(SUM(ta.status = 'pending' AND t.deadline < :now), 0) AS not_done
            FROM task_assignments AS ta
            JOIN tasks AS t ON t.id = ta.task_id
            WHERE t.family_account_id = :family_account_id
              AND ta.child_profile_id = :child_profile_id
              AND t.deadline >= :start
              AND t.deadline < :end
        """, {
            "now": now_local(),
            "family_account_id": family_account_id,
            "child_profile_id": child_profile_id,
            "start": start,
            "end": end,
        })
