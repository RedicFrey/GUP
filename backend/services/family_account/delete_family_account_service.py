from werkzeug.security import check_password_hash

from models import db
from models.family_account_model import FamilyAccountModel
from models.profile_model import ProfileModel
from exceptions import Forbidden, InvalidData, NotFound


class DeleteFamilyAccountService:
    """Exclui a conta família inteira (o banco apaga perfis, tarefas etc. em cascata).

    Só o administrador, e só confirmando a senha da conta.
    """

    def __init__(self, connection):
        self.connection = connection

    def execute(self, family_account_id: int, profile_id: int, password) -> bool:
        family_account = FamilyAccountModel.buscar_por_id(family_account_id)
        if family_account is None:
            raise NotFound("Conta família não encontrada.")

        profile = ProfileModel.buscar_por_id_e_familia(profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")
        if not profile.is_admin():
            raise Forbidden("Apenas o administrador pode excluir a conta família.")

        if not isinstance(password, str) or not check_password_hash(family_account.password_hash, password):
            raise InvalidData("Senha incorreta.")

        family_account.deletar()
        db.session.commit()
        return True
