from controllers.base_controller import BaseController
from utils.auth import responsible_required
from services.notification.list_notification_preferences_service import ListNotificationPreferencesService
from services.notification.update_notification_preferences_service import UpdateNotificationPreferencesService


class NotificationController(BaseController):
    """Recurso: preferências de aviso por e-mail do responsável logado."""

    NAME = "notifications"
    URL_PREFIX = "/notificacoes"

    def register_routes(self):
        self.route("/permitidas", self.listar, ["GET"], responsible_required)
        self.route("/permitidas/atualizar", self.atualizar, ["PUT"], responsible_required)

    def listar(self):
        result = ListNotificationPreferencesService(self.connection).execute(
            self.profile_id, self.family_account_id
        )
        return self.responder(result)

    def atualizar(self):
        result = UpdateNotificationPreferencesService(self.connection).execute(
            self.profile_id, self.family_account_id, self.dados_json()
        )
        return self.responder({"notification": result})
