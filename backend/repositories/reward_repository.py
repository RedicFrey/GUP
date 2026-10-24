
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

    def find_goal_by_child(self, child_profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT r.id     AS reward_id,
                    r.name   AS reward_name,
                    r.amount AS reward_amount,
                    p.id     AS child_profile_id,
                    p.coins  AS child_coins
                FROM profiles AS p
                INNER JOIN rewards AS r ON r.id = p.goal_id
                WHERE p.id = %s
            """, (child_profile_id,))
            return cursor.fetchone()
        finally:
            cursor.close()

    def clear_goal_if(self, child_profile_id, reward_id):
        cursor = self.connection.cursor()
        try:
            cursor.execute("""
                UPDATE profiles
                SET goal_id = NULL
                WHERE id = %s AND goal_id = %s
            """, (child_profile_id, reward_id))
        finally:
            cursor.close()