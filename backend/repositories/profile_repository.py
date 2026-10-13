from repositories.base_repository import BaseRepository
from models.profile_model import ProfileModel

class ProfileRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="profiles", model=ProfileModel)

    def find_by_id(self, target_id, column_name_id="id"):
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = f"SELECT * FROM {self.table} WHERE {column_name_id} = %s"
            cursor.execute(query, (target_id,))
            result = cursor.fetchone()
            return ProfileModel.from_row(result) if result else None
        finally:
            cursor.close()

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


    # talvez eu nem vá fazer isso
    def find_by_email(self, name):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM name WHERE name = %s", (name,))
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