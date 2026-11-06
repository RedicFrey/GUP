from models.profile_model import ProfileModel
from exceptions import NotFound


class ListFamilyProfilesService:
    """Perfis da conta logada, para a tela de escolha de perfil."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, family_account_id: int) -> list:
        profiles = ProfileModel.listar_por_familia(family_account_id)
        if not profiles:
            raise NotFound("Nenhum perfil encontrado nesta conta família.")
        return [profile.to_dict() for profile in profiles]
