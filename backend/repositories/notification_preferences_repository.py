
from repositories.base_repository import BaseRepository
from models.notification_preferences_model import NotificationPreferenceModel

class NotificationPreferenceRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="notification_preferences", model=NotificationPreferenceModel)

    def find_by_profile(self, profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT id, profile_id, type, enabled
                FROM notification_preferences
                WHERE profile_id = %s
            """, (profile_id,))
            rows = cursor.fetchall()
            return [NotificationPreferenceModel(**row) for row in rows]
        finally:
            cursor.close()

    def create_defaults(self, profile_id, types, enabled=False):
        cursor = self.connection.cursor()
        try:
            cursor.executemany("""
                INSERT INTO notification_preferences (profile_id, type, enabled)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE id = id
            """, [(profile_id, type, enabled) for type in types])
        finally:
            cursor.close()

    def upsert(self, profile_id, type, enabled):
        cursor = self.connection.cursor()
        try:
            cursor.execute("""
                INSERT INTO notification_preferences (profile_id, type, enabled)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)
            """, (profile_id, type, enabled))
        finally:
            cursor.close()
