from models.coin_history_model import CoinHistoryModel
from repositories.base_repository import BaseRepository


class CoinHistoryRepository(BaseRepository):
    """Histórico de moedas de uma criança, com filtro de crédito/débito e paginação."""

    @staticmethod
    def _where(child_profile_id, amount_type):
        where = " WHERE child_profile_id = :child_profile_id"
        params = {"child_profile_id": child_profile_id}
        if amount_type:
            where += " AND amount_type = :amount_type"
            params["amount_type"] = amount_type
        return where, params

    def list_by_child(self, child_profile_id, amount_type=None, limit=None, offset=0):
        where, params = self._where(child_profile_id, amount_type)
        sql = "SELECT * FROM coin_history" + where + " ORDER BY created_at DESC, id DESC"
        if limit is not None:
            sql += " LIMIT :limit OFFSET :offset"
            params.update(limit=limit, offset=offset)
        return self._buscar_modelos(CoinHistoryModel, sql, params)

    def count_by_child(self, child_profile_id, amount_type=None):
        where, params = self._where(child_profile_id, amount_type)
        return self._buscar_valor("SELECT COUNT(*) AS total FROM coin_history" + where, params)
