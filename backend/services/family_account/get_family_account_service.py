from models.family_account_model import FamilyAccountModel
from models.profile_model import ProfileModel
from exceptions import NotFound


class GetFamilyAccountService:
    """Dados da conta família com todos os perfis (tela "Minha família")."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, family_account_id: int) -> dict:
        family_account = FamilyAccountModel.buscar_por_id(family_account_id)
        if family_account is None:
            raise NotFound("Conta família não encontrada.")

        profiles = ProfileModel.listar_por_familia(family_account_id)

        return {
            "family_account": family_account.to_dict(),
            "profiles": [profile.to_dict() for profile in profiles],
        }
