
from models.family_account_model import FamilyAccountModel
from models.profile_model import ProfileModel
from repositories.base_repository import BaseRepository


class FamilyAccountRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="family_accounts", model=FamilyAccountModel)

    def list_family_account_members(self, family_account_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT 
                    p.id, 
                    p.name, 
                    p.profile_type, 
                    p.notification_email, 
                    p.family_account_id,
                    p.pin_hash
                FROM profiles AS p
                JOIN family_accounts AS fa ON p.family_account_id = fa.id
                WHERE fa.id = %s
                ORDER BY p.name ASC
            """, (family_account_id,))
            results = cursor.fetchall()
            return [ProfileModel(**line) for line in results]
        finally:
            cursor.close()

    def find_by_email(self, owner_email):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM family_accounts WHERE email = %s",
                (owner_email,)
            )
            result = cursor.fetchone()
            return FamilyAccountModel(**result) if result else None
        finally:
            cursor.close()
