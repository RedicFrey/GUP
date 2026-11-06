import logging

from repositories.notification_preference_repository import NotificationPreferenceRepository
from services.email.send_email_service import SendEmailService

logger = logging.getLogger(__name__)


class NotifyResponsiblesService:
    """Avisa por e-mail os responsáveis da família que ativaram esse tipo de aviso.

    Uma falha no aviso nunca desfaz a ação principal (ela já teve commit).
    """

    def __init__(self, connection):
        self.preference_repo = NotificationPreferenceRepository(connection)
        self.email_service = SendEmailService()

    def execute(self, notification_type: str, family_account_id: int, subject: str, body: str):
        try:
            emails = self.preference_repo.recipient_emails(notification_type, family_account_id)
            self.email_service.execute(emails, subject, body)
        except Exception:
            logger.exception("Falha ao preparar o aviso %s", notification_type)
