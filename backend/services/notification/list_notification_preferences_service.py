from models.profile_model import ProfileModel
from models.notification_preference_model import NotificationPreferenceModel
from repositories.notification_preference_repository import NotificationPreferenceRepository
from exceptions import NotFound


class ListNotificationPreferencesService:
    """Mostra o e-mail de aviso e quais avisos o responsável logado quer receber."""

    def __init__(self, connection):
        self.connection = connection
        self.preference_repo = NotificationPreferenceRepository(connection)

    def execute(self, profile_id: int, family_account_id: int) -> dict:
        profile = ProfileModel.buscar_por_id_e_familia(profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")

        saved = {p.type: p.enabled for p in self.preference_repo.list_by_profile(profile_id)}

        # tipo sem linha no banco conta como desativado
        permissions = {
            key: saved.get(type_, False)
            for type_, key in NotificationPreferenceModel.TYPE_KEYS.items()
        }

        return {"email": profile.notification_email, "permissions": permissions}
