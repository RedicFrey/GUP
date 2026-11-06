from controllers.base_controller import BaseController
from utils.auth import profile_required, responsible_required
from services.redemption.list_redemptions_by_child_service import ListRedemptionsByChildService
from services.redemption.update_redemption_status_service import UpdateRedemptionStatusService


class RedemptionController(BaseController):
    """Recurso: resgates de recompensas."""

    NAME = "redemptions"
    URL_PREFIX = "/resgates_feitos"

    def register_routes(self):
        self.route("/", self.listar, ["GET"], profile_required, strict_slashes=False)
        self.route("/confirmar", self.atualizar_status, ["PUT"], responsible_required)

    def listar(self):
        result = ListRedemptionsByChildService(self.connection).execute(
            profile_id=self.profile_id,
            family_account_id=self.family_account_id,
            profile_type=self.profile_type,
            child_id=self.parametro("crianca_id", int),
            page=self.parametro("pagina", int, 1),
            size=self.parametro("por_pagina", int),
        )
        return self.responder(result)

    def atualizar_status(self):
        result = UpdateRedemptionStatusService(self.connection).execute(
            self.family_account_id, self.dados_json()
        )
        return self.responder(result)
