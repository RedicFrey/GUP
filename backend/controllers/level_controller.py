from controllers.base_controller import BaseController
from utils.auth import profile_required, child_required
from services.level.get_pending_level_up_service import GetPendingLevelUpService
from services.level.acknowledge_level_up_service import AcknowledgeLevelUpService
from services.level.get_level_progress_service import GetLevelProgressService


class LevelController(BaseController):
    """Recurso: nível da criança (aviso de subida e barra de progresso)."""

    NAME = "levels"
    URL_PREFIX = "/niveis"

    def register_routes(self):
        self.route("/pendente", self.ver_pendente, ["GET"], profile_required)
        self.route("/visto", self.marcar_visto, ["POST"], child_required)
        self.route("/progresso", self.ver_progresso, ["GET"], child_required)

    def ver_pendente(self):
        result = GetPendingLevelUpService(self.connection).execute(self.profile_id, self.family_account_id)
        return self.responder(result)

    def marcar_visto(self):
        result = AcknowledgeLevelUpService(self.connection).execute(
            self.profile_id, self.family_account_id, self.dados_json().get("level")
        )
        return self.responder(result)

    def ver_progresso(self):
        result = GetLevelProgressService(self.connection).execute(self.profile_id, self.family_account_id)
        return self.responder(result)
