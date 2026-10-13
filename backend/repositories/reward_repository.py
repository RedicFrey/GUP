from repositories.base_repository import BaseRepository
from models.reward_model import RewardModel


class RewardRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="rewards", model=RewardModel)

    def list_by_family_account(self, family_account_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT r.id, r.name, r.amount, r.family_account_id
                FROM rewards AS r
                WHERE r.family_account_id = %s
                ORDER BY r.amount ASC
            """, (family_account_id,))
            results = cursor.fetchall()
            return [RewardModel(**line) for line in results]
        finally:
            cursor.close()