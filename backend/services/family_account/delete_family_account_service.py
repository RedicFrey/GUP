
from werkzeug.security import check_password_hash

from repositories.family_account_repository import FamilyAccountRepository
from repositories.profile_repository import ProfileRepository
from exceptions import NotFound, InvalidData


class DeleteFamilyAccountService:
    def __init__(self, connection):
        self.connection = connection
        self.family_account_repo = FamilyAccountRepository(connection)
        self.profile_repo = ProfileRepository(connection)

    def execute(self, is_admin: bool, family_account_id: int, profile_id: int, password: str) -> bool:
        if not is_admin:
            raise InvalidData("Apenas o administrador pode excluir a conta família.")
        
        family_account = self.family_account_repo.find_by_id(family_account_id)
        profile = self.profile_repo.find_by_id(profile_id)
        
        if profile.family_account_id != family_account.id:
            raise InvalidData("Você não está nessa conta família")

        if family_account is None:
            raise NotFound("Conta família não pode ser encontrada")

        if not check_password_hash(family_account.password_hash, password or ""):
            raise InvalidData("Senha incorreta.")

        try:
            self.family_account_repo.delete(family_account_id)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return True
