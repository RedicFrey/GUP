from repositories.base_repository import BaseRepository
from models.task_assignment_model import TaskAssignmentModel

class TaskAssignmentRepository(BaseRepository):

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
          (ta.status = 'pending' AND t.deadline < NOW()) AS is_late,
          ta.completion_date,
          ta.proof_photo
        FROM tasks AS t
        JOIN task_assignments AS ta ON ta.task_id = t.id
    """

    def _execute(self, query, parameters):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(query, tuple(parameters))
            return cursor.fetchall()
        finally:
            cursor.close()
        
    def __init__(self, connection):
        super().__init__(connection, table="task_assignments", model=TaskAssignmentModel)

    def monthly_report(self, family_account_id, child_profile_id, start, end):
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = """
                SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(ta.status = 'done'), 0) AS done_total,
                    COALESCE(SUM(
                        ta.status = 'done'
                        AND COALESCE(ta.submitted_at, ta.completion_date) > t.deadline
                    ), 0) AS done_late,
                    COALESCE(SUM(ta.status = 'pending' AND t.deadline < NOW()), 0) AS not_done
                FROM task_assignments AS ta
                JOIN tasks AS t ON t.id = ta.task_id
                WHERE t.family_account_id = %s
                AND ta.child_profile_id = %s
                AND t.deadline >= %s
                AND t.deadline < %s
            """
            cursor.execute(query, (family_account_id, child_profile_id, start, end))
            row = cursor.fetchone()
        finally:
            cursor.close()

        return row

    def _build_filters(self, data):
        where = " WHERE t.family_account_id = %s"
        parameters = [data["family_account_id"]]

        status = data.get("status")
        period = data.get("period")

        if status == "late":
            # pendente e com o prazo já vencido
            where += " AND ta.status = 'pending' AND t.deadline < NOW()"
        elif status:
            where += " AND ta.status = %s"
            parameters.append(status)

        if period:
            where += " AND t.deadline > %s"
            parameters.append(period)
        elif status != "awaiting_approval":
            # Tudo e Atrasadas: só as de hoje. Em espera: qualquer dia.
            where += " AND DATE(t.deadline) = CURDATE()"

        if data.get("child_profile_id"):
            where += " AND ta.child_profile_id = %s"
            parameters.append(data["child_profile_id"])

        return where, parameters

    def list_by_account_with_status(self, data):
        where, parameters = self._build_filters(data)
        # ta.id desempata prazos iguais; sem isso o LIMIT/OFFSET pode repetir ou pular cards
        query = self._SELECT_BASE + where + " ORDER BY t.deadline ASC, ta.id ASC"

        size = data.get("size")
        if size:
            query += " LIMIT %s OFFSET %s"
            parameters += [size, (data.get("page", 1) - 1) * size]

        return self._execute(query, parameters)

    def count_by_account_with_status(self, data):
        where, parameters = self._build_filters(data)
        rows = self._execute(
            "SELECT COUNT(*) AS total FROM tasks AS t "
            "JOIN task_assignments AS ta ON ta.task_id = t.id" + where,
            parameters,
        )
        return rows[0]["total"]
    

    def list_task(self, family_account_id, task_id=None, status=None,
              deadline_on=None, deadline_from=None):
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = """
                SELECT
                    t.id AS task_id,
                    ta.id AS child_task_id,
                    t.name,
                    t.description,
                    t.deadline,
                    t.coins_reward,
                    t.xp_reward,
                    t.required_proof,
                    ta.id AS assignment_id,
                    ta.status,
                    ta.proof_photo,
                    p.id AS child_profile_id,
                    p.name AS child_name
                FROM tasks AS t
                JOIN task_assignments AS ta ON ta.task_id = t.id
                JOIN profiles AS p ON p.id = ta.child_profile_id
                WHERE t.family_account_id = %s
            """
            parameters = [family_account_id]

            if task_id:
                query += " AND t.id = %s"
                parameters.append(task_id)

            if deadline_on:
                query += " AND DATE(t.deadline) = %s"
                parameters.append(deadline_on)

            if deadline_from:
                query += " AND DATE(t.deadline) >= %s"
                parameters.append(deadline_from)

            query += " ORDER BY t.deadline ASC, t.id ASC, ta.id ASC"

            cursor.execute(query, tuple(parameters))
            rows = cursor.fetchall()
        finally:
            cursor.close()

        if not rows:
            return None if task_id else []

        rows_by_task = {}
        for r in rows:
            rows_by_task.setdefault(r["task_id"], []).append(r)

        tasks = [self._build_task(task_rows) for task_rows in rows_by_task.values()]

        if task_id:
            return tasks[0]  

        return tasks        

    @staticmethod
    def _build_task(rows):
        first = rows[0]
        return {
            "task_id": first["task_id"],
            "child_task_id": first["child_task_id"],
            "name": first["name"],
            "description": first["description"],
            "deadline": first["deadline"],
            "coins_reward": first["coins_reward"],
            "xp_reward": first["xp_reward"],
            "required_proof": bool(first["required_proof"]),
            "children": [
                {
                    "assignment_id": r["assignment_id"],
                    "child_profile_id": r["child_profile_id"],
                    "name": r["child_name"],
                    "status": r["status"],
                    "proof_photo": r["proof_photo"],
                }
                for r in rows
            ],
        }
    
    def list_late_today(self, family_account_id, child_profile_id=None):
        query = self._SELECT_BASE + """
            WHERE t.family_account_id = %s
            AND DATE(t.deadline) = CURDATE()
            AND t.deadline < NOW()
            AND ta.status != 'done'
        """
        parameters = [family_account_id]

        if child_profile_id:
            query += " AND ta.child_profile_id = %s"
            parameters.append(child_profile_id)

        query += " ORDER BY t.deadline ASC"
        return self._execute(query, parameters)

    def find_for_update(self, assignment_id):
        """Busca a atribuição já com os dados da tarefa e trava a linha até o commit/rollback."""
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT
                    ta.id AS assignment_id,
                    ta.task_id,
                    ta.child_profile_id,
                    ta.status,
                    ta.proof_photo,
                    t.name,
                    t.coins_reward,
                    t.xp_reward,
                    t.required_proof,
                    t.family_account_id
                FROM task_assignments AS ta
                JOIN tasks AS t ON t.id = ta.task_id
                WHERE ta.id = %s
                FOR UPDATE
            """, (assignment_id,))
            return cursor.fetchone()
        finally:
            cursor.close()

    def update_status(self, assignment_id, status, proof_photo=None, completion_date=None, submitted_at=None):
        sets = ["status = %s"]
        params = [status]
        if proof_photo is not None:
            sets.append("proof_photo = %s")
            params.append(proof_photo)
        if completion_date is not None:
            sets.append("completion_date = %s")
            params.append(completion_date)
        if submitted_at is not None:
            sets.append("submitted_at = %s")
            params.append(submitted_at)
        params.append(assignment_id)

        cursor = self.connection.cursor()
        try:
            cursor.execute(
                f"UPDATE task_assignments SET {', '.join(sets)} WHERE id = %s",
                tuple(params),
            )
        finally:
            cursor.close()

    def find_detail(self, assignment_id):
        rows = self._execute(self._SELECT_BASE + " WHERE ta.id = %s", [assignment_id])
        return rows[0] if rows else None

    def list_task_page(self, family_account_id, deadline_on=None, deadline_from=None,
                       page=1, size=6):
        where = " WHERE t.family_account_id = %s"
        parameters = [family_account_id]

        if deadline_on:
            where += " AND DATE(t.deadline) = %s"
            parameters.append(deadline_on)

        if deadline_from:
            where += " AND DATE(t.deadline) >= %s"
            parameters.append(deadline_from)

        base = """
            FROM tasks AS t
            JOIN task_assignments AS ta ON ta.task_id = t.id
            JOIN profiles AS p ON p.id = ta.child_profile_id
        """ + where

        # 1) quantas tarefas existem (não linhas)
        total = self._execute("SELECT COUNT(DISTINCT t.id) AS total " + base, parameters)[0]["total"]
        if total == 0:
            return {"tasks": [], "total": 0}

        # 2) só os ids das tarefas desta página
        id_rows = self._execute(
            "SELECT DISTINCT t.id, t.deadline " + base +
            " ORDER BY t.deadline ASC, t.id ASC LIMIT %s OFFSET %s",
            parameters + [size, (page - 1) * size],
        )
        task_ids = [r["id"] for r in id_rows]
        if not task_ids:
            return {"tasks": [], "total": total}

        # 3) as linhas (tarefa + crianças) só dessas tarefas
        placeholders = ", ".join(["%s"] * len(task_ids))
        rows = self._execute(f"""
            SELECT
                t.id AS task_id,
                ta.id AS child_task_id,
                t.name,
                t.description,
                t.deadline,
                t.coins_reward,
                t.xp_reward,
                t.required_proof,
                ta.id AS assignment_id,
                ta.status,
                ta.proof_photo,
                p.id AS child_profile_id,
                p.name AS child_name
            FROM tasks AS t
            JOIN task_assignments AS ta ON ta.task_id = t.id
            JOIN profiles AS p ON p.id = ta.child_profile_id
            WHERE t.family_account_id = %s AND t.id IN ({placeholders})
            ORDER BY t.deadline ASC, t.id ASC, ta.id ASC
        """, [family_account_id, *task_ids])

        rows_by_task = {}
        for r in rows:
            rows_by_task.setdefault(r["task_id"], []).append(r)

        return {
            "tasks": [self._build_task(task_rows) for task_rows in rows_by_task.values()],
            "total": total,
        }
    