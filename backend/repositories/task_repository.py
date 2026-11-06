from repositories.base_repository import BaseRepository


class TaskRepository(BaseRepository):
    """Tarefas da família já com as crianças de cada uma (join tasks + assignments + profiles)."""

    _SELECT_WITH_CHILDREN = """
        SELECT
            t.id AS task_id,
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
    """

    @staticmethod
    def _deadline_filter(family_account_id, deadline_on, deadline_from):
        where = " WHERE t.family_account_id = :family_account_id"
        params = {"family_account_id": family_account_id}
        if deadline_on:
            where += " AND DATE(t.deadline) = :deadline_on"
            params["deadline_on"] = deadline_on
        if deadline_from:
            where += " AND DATE(t.deadline) >= :deadline_from"
            params["deadline_from"] = deadline_from
        return where, params

    def find_with_children(self, task_id, family_account_id, deadline_on=None, deadline_from=None):
        where, params = self._deadline_filter(family_account_id, deadline_on, deadline_from)
        params["task_id"] = task_id
        rows = self._buscar_varios(
            self._SELECT_WITH_CHILDREN + where + " AND t.id = :task_id ORDER BY ta.id ASC",
            params,
        )
        tasks = self._group_by_task(rows)
        return tasks[0] if tasks else None

    def list_page_with_children(self, family_account_id, deadline_on=None, deadline_from=None,
                                page=1, size=6):
        where, params = self._deadline_filter(family_account_id, deadline_on, deadline_from)
        base = " FROM tasks AS t JOIN task_assignments AS ta ON ta.task_id = t.id" + where

        # a paginação conta tarefas, não linhas (uma tarefa tem várias crianças)
        total = self._buscar_valor("SELECT COUNT(DISTINCT t.id) AS total" + base, params)
        if total == 0:
            return {"tasks": [], "total": 0}

        id_rows = self._buscar_varios(
            "SELECT DISTINCT t.id, t.deadline" + base +
            " ORDER BY t.deadline ASC, t.id ASC LIMIT :limit OFFSET :offset",
            {**params, "limit": size, "offset": (page - 1) * size},
        )
        task_ids = [row["id"] for row in id_rows]
        if not task_ids:
            return {"tasks": [], "total": total}

        rows = self._buscar_varios(
            self._SELECT_WITH_CHILDREN +
            " WHERE t.family_account_id = :family_account_id AND t.id IN :task_ids"
            " ORDER BY t.deadline ASC, t.id ASC, ta.id ASC",
            {"family_account_id": family_account_id, "task_ids": task_ids},
            listas=("task_ids",),
        )
        return {"tasks": self._group_by_task(rows), "total": total}

    @staticmethod
    def _group_by_task(rows):
        """Junta as linhas (uma por criança) em um dicionário por tarefa."""
        grouped = {}
        for row in rows:
            grouped.setdefault(row["task_id"], []).append(row)

        tasks = []
        for task_rows in grouped.values():
            first = task_rows[0]
            tasks.append({
                "task_id": first["task_id"],
                "child_task_id": first["assignment_id"],
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
                    for r in task_rows
                ],
            })
        return tasks
