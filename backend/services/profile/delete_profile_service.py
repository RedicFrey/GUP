from models import db
from models.profile_model import ProfileModel
from exceptions import Forbidden, InvalidData, NotFound


class DeleteProfileService:
    """O admin exclui um perfil da família (nunca o próprio admin)."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, target_profile_id: int, family_account_id: int, admin_id: int) -> bool:
        admin = ProfileModel.buscar_por_id_e_familia(admin_id, family_account_id)
        if admin is None or not admin.is_admin():
            raise Forbidden("Apenas o administrador pode excluir perfis.")

        profile = ProfileModel.buscar_por_id_e_familia(target_profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")

        if profile.id == admin.id or profile.is_admin():
            raise InvalidData("Não é possível excluir o administrador da conta.")

        profile.deletar()
        db.session.commit()
        return True
