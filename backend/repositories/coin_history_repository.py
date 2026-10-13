from repositories.base_repository import BaseRepository
from models.coin_history_model import CoinHistoryModel

class CoinHistoryRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="coin_history", model=CoinHistoryModel)

    def list_by_child(self, child_profile_id, amount_type=None, limit=None, offset=0):
        """Mais recentes primeiro. Com limit, devolve só aquela página (LIMIT/OFFSET)."""
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = "SELECT * FROM coin_history WHERE child_profile_id = %s"
            params = [child_profile_id]

            if amount_type:
                query += " AND amount_type = %s"
                params.append(amount_type)

            # id desempata movimentações no mesmo instante: sem isso uma linha pode
            # aparecer em duas páginas (ou em nenhuma) quando a ordem não é determinística
            query += " ORDER BY created_at DESC, id DESC"

            if limit is not None:
                query += " LIMIT %s OFFSET %s"
                params.extend([limit, offset])

            cursor.execute(query, params)
            return [CoinHistoryModel(**line) for line in cursor.fetchall()]
        finally:
            cursor.close()

    def count_by_child(self, child_profile_id, amount_type=None):
        """Total de movimentações (com o mesmo filtro da listagem), para calcular as páginas."""
        cursor = self.connection.cursor(dictionary=True)
        try:
            query = "SELECT COUNT(*) AS total FROM coin_history WHERE child_profile_id = %s"
            params = [child_profile_id]

            if amount_type:
                query += " AND amount_type = %s"
                params.append(amount_type)

            cursor.execute(query, params)
            return cursor.fetchone()["total"]
        finally:
            cursor.close()
            