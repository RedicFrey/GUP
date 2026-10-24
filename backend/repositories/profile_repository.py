
from repositories.base_repository import BaseRepository
from models.profile_model import ProfileModel

class ProfileRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="profiles", model=ProfileModel)

    def _to_model(self, row):
        return ProfileModel.from_row(row)

    def list_by_account(self, family_account_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM profiles WHERE family_account_id = %s ORDER BY created_at",
                (family_account_id,)
            )
            rows = cursor.fetchall()
            return [ProfileModel.from_row(row) for row in rows] 
        finally:
            cursor.close()

    def find_by_email(self, email):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM profiles WHERE notification_email = %s", (email,))
            result = cursor.fetchone()
            return ProfileModel(**result) if result else None
        finally:
            cursor.close()

    def find_by_id_and_family(self, profile_id, family_account_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM profiles WHERE id = %s AND family_account_id = %s",
                (profile_id, family_account_id),
            )
            row = cursor.fetchone()
            return ProfileModel.from_row(row) if row else None
        finally:
            cursor.close()

    def update_notification_email(self, profile_id, email):
        cursor = self.connection.cursor()
        try:
            cursor.execute("""
                UPDATE profiles
                SET notification_email = %s
                WHERE id = %s
            """, (email, profile_id))
        finally:
            cursor.close()

    def clear_pin(self, profile_id):
        cursor = self.connection.cursor()
        try:
            cursor.execute(
                "UPDATE profiles SET pin_hash = NULL WHERE id = %s",
                (profile_id,),
            )
        finally:
            cursor.close()