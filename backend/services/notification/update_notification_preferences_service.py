import re
from repositories.notification_preferences_repository import NotificationPreferenceRepository
from repositories.profile_repository import ProfileRepository
from models.notification_preferences_model import NOTIFICATION_TYPE_KEYS
from exceptions import InvalidData

KEY_TO_TYPE = {key: type for type, key in NOTIFICATION_TYPE_KEYS.items()}
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class NotificationPreferenceUpdateService():
    def __init__(self, connection):
        self.connection = connection
        self.preference_repo = NotificationPreferenceRepository(connection)
        self.profile_repo = ProfileRepository(connection)

    def execute(self, profile_id: int, data: dict) -> dict:
        data = data or {}
        permissions = data.get("permissions")
        has_email = "email" in data      # null significa "remover", então não dá para usar data.get

        if permissions is None and not has_email:
            raise InvalidData("Envie o e-mail ou as permissões que deseja alterar.")

        if permissions is not None:
            if not isinstance(permissions, dict) or not permissions:
                raise InvalidData("Envie as permissões que deseja alterar.")

            # valida tudo primeiro, para não gravar metade e falhar no meio
            for key, enabled in permissions.items():
                if key not in KEY_TO_TYPE:
                    raise InvalidData(f"Permissão inválida: {key}")
                if not isinstance(enabled, bool):
                    raise InvalidData("Informe cada permissão como true ou false.")

        email = None
        if has_email:
            raw_email = data["email"]
            if raw_email is not None and not isinstance(raw_email, str):
                raise InvalidData("E-mail inválido.")

            email = (raw_email or "").strip() or None      # vazio também vira "remover"
            if email and not EMAIL_PATTERN.match(email):
                raise InvalidData("Informe um e-mail válido.")

        try:
            if permissions:
                for key, enabled in permissions.items():
                    self.preference_repo.upsert(profile_id, KEY_TO_TYPE[key], enabled)

            if has_email:
                self.profile_repo.update_notification_email(profile_id, email)

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return {"ok": True}
    