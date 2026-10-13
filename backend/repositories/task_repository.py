from repositories.base_repository import BaseRepository
from models.task_model import TaskModel

class TaskRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="tasks", model=TaskModel)

    # def list_by_child(self, child_profile_id, status=None):
    #     cursor = self.connection.cursor(dictionary=True)
    #     try:
    #         query = """
    #             SELECT
    #             t.id AS task_id,
    #             ta.id AS assignment_id,
    #             t.name,
    #             t.coin_reward,
    #             t.xp_reward,
    #             ta.status,
    #             ta.completion_date,
    #             ta.proof_photo
    #             FROM tasks AS t
    #             JOIN task_assignments AS ta ON ta.task_id = t.id
    #             WHERE ta.child_profile_id = %s
    #         """
    #         parametros = [child_profile_id]
    #         if status:
    #             query += " AND ta.status = %s"
    #             parametros.append(status)
    #         query += " ORDER BY t.deadline ASC"
            
    #         cursor.execute(query, tuple(parametros))
    #         return cursor.fetchall()   # já vem como lista de dict, pronto pro jsonify
    #     finally:
    #         cursor.close()

    def list_by_account(self, family_account_id, status=None):
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = "SELECT * FROM tasks WHERE family_account_id = %s"
            parametros = [family_account_id]
            if status:
                query += " AND ta.status = %s"
                parametros.append(status)
                query += " ORDER BY t.deadline ASC"
            query += " ORDER BY deadline ASC"
            cursor.execute(query, tuple(parametros))
            return [TaskModel(**row) for row in cursor.fetchall()]
        finally:
            cursor.close()

    def find_with_children(self, task_id, family_account_id):
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
                    p.id AS child_id,
                    p.name AS child_name
                FROM tasks AS t
                JOIN task_assignments AS ta ON ta.task_id = t.id
                JOIN profiles AS p ON p.id = ta.child_profile_id
                WHERE t.id = %s
                AND t.family_account_id = %s
            """
            cursor.execute(query, (task_id, family_account_id))
            rows = cursor.fetchall()
        finally:
            cursor.close()

        if not rows:
            return None

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
                    "child_id": r["child_id"],
                    "name": r["child_name"],
                    "status": r["status"],
                    "proof_photo": r["proof_photo"],
                }
                for r in rows
            ],
        }

    def list_by_child(self, task_assignment_id, child_profile_id, family_account_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = """
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
                    INNER JOIN tasks AS t ON ta.task_id = t.id
                    INNER JOIN profiles AS p ON ta.child_profile_id = p.id
                WHERE ta.id = %s
                    AND t.family_account_id = %s
                    AND ta.child_profile_id = %s
            """
            cursor.execute(query, (task_assignment_id, family_account_id, child_profile_id))
            row = cursor.fetchone()
        finally:
            cursor.close()

        if not row:
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
   
