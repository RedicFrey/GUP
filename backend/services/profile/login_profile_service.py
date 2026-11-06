from werkzeug.security import check_password_hash

from models.profile_model import ProfileModel
from exceptions import InvalidData, NotFound
from utils.login_attempts import profile_pin_attempts


class LoginProfileService:
    """Escolhe um perfil da conta logada, conferindo o PIN quando o perfil tem um."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, family_account_id: int, profile_id: int, pin=None) -> dict:
        profile = ProfileModel.buscar_por_id_e_familia(profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")

        if profile.has_pin():
            attempts_key = f"profile:{profile.id}"
            profile_pin_attempts.check(attempts_key)

            if pin is None or str(pin) == "":
                raise InvalidData("Este perfil exige PIN.")
            if not check_password_hash(profile.pin_hash, str(pin)):
                profile_pin_attempts.fail(attempts_key)
                raise InvalidData("PIN incorreto.")

            profile_pin_attempts.reset(attempts_key)

        return profile.to_dict()
