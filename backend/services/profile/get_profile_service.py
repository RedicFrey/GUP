from models.profile_model import ProfileModel
from exceptions import NotFound


class GetProfileService:
    """Dados de um perfil da própria família (o perfil logado ou, para o admin, qualquer um)."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, profile_id: int, family_account_id: int) -> dict:
        profile = ProfileModel.buscar_por_id_e_familia(profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")
        return profile.to_dict()
