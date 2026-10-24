
from models.coin_history_model import CoinHistoryModel
from repositories.coin_history_repository import CoinHistoryRepository
from exceptions import InvalidData


class CreateCoinHistoryService:

    def __init__(self, connection):
        self.connection = connection
        self.history_repo = CoinHistoryRepository(connection)

    def execute(self, child_profile_id: int, source: str, amount: int, amount_type: str, name: str):
        if amount_type not in ("credit", "debit"):
            raise InvalidData("tipo_valor deve ser 'entrada' ou 'saida'.")
        if source not in ("task", "redemption", "manual_adjustment"):
            raise InvalidData("A origem deve ser 'tarefa ou recompensa ou ajuste_manual'.")
        if amount < 0:
            raise InvalidData("valor deve ser sempre positivo; o sinal é dado por tipo_valor.")
 
        coin_history = CoinHistoryModel(
            child_profile_id=child_profile_id,
            amount_type=amount_type,
            source=source,
            amount=amount,
            name=name,
        )
        self.history_repo.create(coin_history.to_insertion())