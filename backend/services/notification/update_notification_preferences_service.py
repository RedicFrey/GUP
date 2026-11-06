from models import db
from models.profile_model import ProfileModel
from models.notification_preference_model import NotificationPreferenceModel
from repositories.notification_preference_repository import NotificationPreferenceRepository
from exceptions import InvalidData, NotFound
from utils.validators import validate_email

KEY_TO_TYPE = {key: type_ for type_, key in NotificationPreferenceModel.TYPE_KEYS.items()}


class UpdateNotificationPreferencesService:
    """Salva o e-mail de aviso e os avisos que o responsável logado quer receber."""

    def __init__(self, connection):
        self.connection = connection
        self.preference_repo = NotificationPreferenceRepository(connection)

    def execute(self, profile_id: int, family_account_id: int, data: dict) -> dict:
        permissions = data.get("permissions")
        has_email = "email" in data   # null significa "remover", então não dá para usar data.get

        if permissions is None and not has_email:
            raise InvalidData("Envie o e-mail ou as permissões que deseja alterar.")

        profile = ProfileModel.buscar_por_id_e_familia(profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")

        if permissions is not None:
            self._validate_permissions(permissions)

        email = self._parse_email(data["email"]) if has_email else None

        for key, enabled in (permissions or {}).items():
            self.preference_repo.upsert(profile_id, KEY_TO_TYPE[key], enabled)

        if has_email:
            profile.atualizar(notification_email=email)

        db.session.commit()
        return {"ok": True}

    @staticmethod
    def _validate_permissions(permissions):
        # valida tudo antes de gravar, para não salvar metade e falhar no meio
        if not isinstance(permissions, dict) or not permissions:
            raise InvalidData("Envie as permissões que deseja alterar.")
        for key, enabled in permissions.items():
            if key not in KEY_TO_TYPE:
                raise InvalidData(f"Permissão inválida: {key}")
            if not isinstance(enabled, bool):
                raise InvalidData("Informe cada permissão como true ou false.")

    @staticmethod
    def _parse_email(raw_email):
        if raw_email is None or (isinstance(raw_email, str) and not raw_email.strip()):
            return None   # vazio também é "remover"
        return validate_email(raw_email)
