from models import db
from models.coin_history_model import CoinHistoryModel
from repositories.child_repository import ChildRepository
from exceptions import InvalidData, NotFound
from utils.validators import validate_positive_int, validate_text

REASON_PREFIX = "Ajuste manual: "
# o motivo vai no nome do histórico (VARCHAR(50)) depois do prefixo
MAX_REASON_LENGTH = CoinHistoryModel.MAX_NAME_LENGTH - len(REASON_PREFIX)
MAX_ADJUST = 100_000
ADJUSTMENT_TYPES = ("add", "remove")


class AdjustChildCoinsService:
    """O responsável adiciona ou remove moedas de uma criança, com motivo obrigatório."""

    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)

    def execute(self, family_account_id: int, child_profile_id: int, data: dict) -> dict:
        adjustment_type = data.get("type")
        if adjustment_type not in ADJUSTMENT_TYPES:
            raise InvalidData("Informe se o ajuste é para adicionar ou remover moedas.")

        amount = data.get("amount")
        if isinstance(amount, int) and not isinstance(amount, bool):
            amount = abs(amount)   # o sinal vem do tipo do ajuste
        amount = validate_positive_int(amount, "O valor", maximum=MAX_ADJUST)
        reason = validate_text(data.get("reason"), "O motivo", max_length=MAX_REASON_LENGTH)

        child = self.child_repo.find_for_update(child_profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        is_credit = adjustment_type == "add"
        if is_credit:
            child.add_coins(amount)
        else:
            child.remove_coins(amount)

        child.atualizar(coins=child.coins)
        CoinHistoryModel(
            name=f"{REASON_PREFIX}{reason}",
            source=CoinHistoryModel.MANUAL_ADJUSTMENT,
            amount_type=CoinHistoryModel.CREDIT if is_credit else CoinHistoryModel.DEBIT,
            amount=amount,
            child_profile_id=child.id,
        ).salvar()

        db.session.commit()
        return child.to_dict()
