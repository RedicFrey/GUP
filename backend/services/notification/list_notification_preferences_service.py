
from repositories.notification_preferences_repository import NotificationPreferenceRepository
from repositories.profile_repository import ProfileRepository
from models.notification_preferences_model import NOTIFICATION_TYPE_KEYS
from exceptions import NotFound

class ListNotificationPreferencesService:
    def __init__(self, connection):
        self.connection = connection
        self.preference_repo = NotificationPreferenceRepository(connection)
        self.profile_repo = ProfileRepository(connection)

    def execute(self, profile_id: int) -> dict:
        profile = self.profile_repo.find_by_id(profile_id)
        if not profile:
            raise NotFound("Perfil não encontrado.")

        saved = {p.type: p.enabled for p in self.preference_repo.find_by_profile(profile_id)}

        # tipo sem linha no banco conta como desativado
        permissions = {
            key: saved.get(type, False)
            for type, key in NOTIFICATION_TYPE_KEYS.items()
        }

        return {
            "email": profile.notification_email,
            "permissions": permissions,
        }