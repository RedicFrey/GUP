from models.family_account_model import FamilyAccountModel
from repositories.base_repository import BaseRepository


class FamilyAccountRepository(BaseRepository):
    """Consultas especiais sobre a conta família."""

    def find_by_email(self, email):
        return self._buscar_modelo(
            FamilyAccountModel,
            "SELECT * FROM family_accounts WHERE email = :email",
            {"email": email},
        )
