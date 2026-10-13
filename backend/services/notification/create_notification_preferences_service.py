
from repositories.notification_preferences_repository import NotificationPreferenceRepository
from models.notification_preferences_model import NOTIFICATION_TYPES

class NotificationPreferencesCreateService():
    def __init__(self, connection):
        self.connection = connection
        self.preference_repo = NotificationPreferenceRepository(connection)

    def execute(self, profile_id: int, enabled: bool = False) -> list:
        self.preference_repo.create_defaults(profile_id, NOTIFICATION_TYPES, enabled)

        return [
            {"type": type, "enabled": enabled}
            for type in NOTIFICATION_TYPES
        ]
