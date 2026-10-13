
from models.profile_model import ProfileModel
from exceptions import InvalidData
from repositories.profile_repository import ProfileRepository
from services.notification.create_notification_preferences_service import NotificationPreferencesCreateService

class AdminProfileCreationService:

    def __init__(self, connection):
        self.profile_repo = ProfileRepository(connection)
        self.notification_service = NotificationPreferencesCreateService(connection)

    def create_admin(self, family_account_id: int, name: str, notification_email: str) -> dict:

        if family_account_id is None:
            raise InvalidData(f"Erro ao tentar interligar com a conta família.")

        if not name or not notification_email:
            raise InvalidData(f"Faltou um campo, não pode ser possível criar o perfil do admin")

        profile = ProfileModel(
            name=name,
            notification_email=notification_email,
            profile_type="responsible",
            family_account_id=family_account_id,
            role="admin"
        )

        profile.id = self.profile_repo.create(profile.to_insertion())

        self.notification_service.execute(profile.id)

        return profile.to_dict()