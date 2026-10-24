
from repositories.coin_history_repository import CoinHistoryRepository


class ListCoinHistoryByChildService:

    def __init__(self, conexao):
        self.historico_repo = CoinHistoryRepository(conexao)

    def execute(self, crianca_id: int, amount_type=None, limit=None, offset=0):
        return self.historico_repo.list_by_child(
            crianca_id, amount_type=amount_type, limit=limit, offset=offset
        )

    def count(self, crianca_id: int, amount_type=None):
        return self.historico_repo.count_by_child(crianca_id, amount_type=amount_type)