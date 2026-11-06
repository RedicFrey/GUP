from controllers.base_controller import BaseController
from utils.auth import profile_required, responsible_required
from services.coin_history.list_coin_history_service import ListCoinHistoryService
from services.coin_history.adjust_child_coins_service import AdjustChildCoinsService


class CoinHistoryController(BaseController):
    """Recurso: histórico de moedas (consulta e ajuste manual)."""

    NAME = "coin_history"
    URL_PREFIX = "/historicos"

    def register_routes(self):
        self.route("/", self.listar, ["GET"], profile_required, strict_slashes=False)
        self.route("/ajustar/<int:child_id>", self.ajustar, ["POST"], responsible_required)

    def listar(self):
        result = ListCoinHistoryService(self.connection).execute(
            profile_id=self.profile_id,
            family_account_id=self.family_account_id,
            profile_type=self.profile_type,
            child_id=self.parametro("child_id", int),
            amount_type=self.parametro("filter"),
            page=self.parametro("page", int, 1),
            size=self.parametro("size", int),
        )
        return self.responder(result)

    def ajustar(self, child_id):
        child = AdjustChildCoinsService(self.connection).execute(
            family_account_id=self.family_account_id,
            child_profile_id=child_id,
            data=self.dados_json(),
        )
        return self.responder(child)
