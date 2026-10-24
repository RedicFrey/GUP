
from repositories.base_repository import BaseRepository
from models.redemption_model import RedemptionModel


class RedemptionRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="redemptions", model=RedemptionModel)

    def list_by_child(self, offset, elements_by_page, child_profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT * FROM redemptions
                WHERE child_profile_id = %s
                ORDER BY created_at DESC, id DESC
                LIMIT %s
                OFFSET %s
            """, (child_profile_id, elements_by_page, offset))
            results = cursor.fetchall()
            return [RedemptionModel(**line) for line in results]
        finally:
            cursor.close()

    def count_by_child_redemption(self, child_profile_id):
        cursor = self.connection.cursor()
        query = ("""
            SELECT COUNT(*) FROM redemptions
            WHERE child_profile_id = %s
        """)
        try:
            cursor.execute(query, (child_profile_id,))
            result = cursor.fetchone()
            return result[0]
        finally:
            cursor.close()