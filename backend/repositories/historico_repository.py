from repositories.base_repository import BaseRepository
from models.historico_moeda_model import HistoricoMoeda

class HistoricoRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="historico_moedas", modelo=HistoricoMoeda)

    def listar_por_crianca(self, crianca_id, tipo_valor=None):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            query = "SELECT * FROM historico_moedas WHERE crianca_id = %s"
            params = [crianca_id]

            if tipo_valor:
                query += " AND tipo_valor = %s"
                params.append(tipo_valor)

            query += " ORDER BY data_criacao DESC"

            cursor = self.conexao.cursor(dictionary=True)
            cursor.execute(query, params)
            return [HistoricoMoeda(**linha) for linha in cursor.fetchall()]
        finally:
            cursor.close()