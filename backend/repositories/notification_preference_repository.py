from models.notification_preference_model import NotificationPreferenceModel
from repositories.base_repository import BaseRepository


class NotificationPreferenceRepository(BaseRepository):
    """Preferências de aviso por perfil e destinatários de cada tipo de aviso.

    create_defaults e upsert continuam aqui (mesmos nomes de antes, para os Services
    não mudarem), mas a gravação em si é feita pela Model (salvar/atualizar), sem SQL
    de escrita e sem commit.
    """

    def list_by_profile(self, profile_id):
        return self._buscar_modelos(
            NotificationPreferenceModel,
            "SELECT * FROM notification_preferences WHERE profile_id = :profile_id",
            {"profile_id": profile_id},
        )

    def _find(self, profile_id, type_):
        return self._buscar_modelo(NotificationPreferenceModel, """
            SELECT * FROM notification_preferences
            WHERE profile_id = :profile_id AND type = :type
        """, {"profile_id": profile_id, "type": type_})

    def create_defaults(self, profile_id, enabled=False):
        """Cria uma linha por tipo de aviso, sem duplicar as que já existem."""
        existing = {preference.type for preference in self.list_by_profile(profile_id)}
        for type_ in NotificationPreferenceModel.TYPES:
            if type_ not in existing:
                NotificationPreferenceModel(profile_id=profile_id, type=type_, enabled=enabled).salvar()

    def upsert(self, profile_id, type_, enabled):
        preference = self._find(profile_id, type_)
        if preference is None:
            NotificationPreferenceModel(profile_id=profile_id, type=type_, enabled=enabled).salvar()
        else:
            preference.atualizar(enabled=enabled)

    def recipient_emails(self, type_, family_account_id):
        """E-mails dos responsáveis da família que ativaram esse tipo de aviso."""
        rows = self._buscar_varios("""
            SELECT p.notification_email
            FROM notification_preferences AS np
            JOIN profiles AS p ON p.id = np.profile_id
            WHERE np.type = :type
              AND np.enabled = TRUE
              AND p.family_account_id = :family_account_id
              AND p.profile_type = 'responsible'
              AND p.notification_email IS NOT NULL
        """, {"type": type_, "family_account_id": family_account_id})
        return [row["notification_email"] for row in rows]
