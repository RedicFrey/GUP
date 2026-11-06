from werkzeug.security import generate_password_hash

from models import db
from models.profile_model import ProfileModel
from exceptions import Forbidden, InvalidData, NotFound
from utils.validators import validate_email, validate_pin, validate_text


class UpdateProfileService:
    """Altera nome, e-mail de aviso e PIN de um perfil.

    Cada perfil altera o próprio; o admin altera qualquer perfil da família.
    Moedas, XP, nível e meta não mudam por aqui.
    """

    def __init__(self, connection):
        self.connection = connection

    def execute(self, target_profile_id: int, family_account_id: int,
                editor_id: int, editor_is_admin: bool, data: dict) -> bool:
        profile = ProfileModel.buscar_por_id_e_familia(target_profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")

        if profile.id != editor_id and not editor_is_admin:
            raise Forbidden("Você só pode alterar o seu próprio perfil.")

        fields = {}

        if "name" in data:
            fields["name"] = validate_text(data["name"], "Nome", max_length=ProfileModel.MAX_NAME_LENGTH)

        if data.get("notification_email"):
            fields["notification_email"] = validate_email(data["notification_email"])

        if "pin" in data:
            # pin: null remove o PIN; texto vira o novo PIN
            pin = data["pin"]
            fields["pin_hash"] = None if pin is None else generate_password_hash(validate_pin(pin))

        if not fields:
            raise InvalidData("Nenhum dado válido para atualizar.")

        profile.atualizar(**fields)
        db.session.commit()
        return True
