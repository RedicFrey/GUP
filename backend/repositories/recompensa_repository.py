from repositories.base_repository import BaseRepository
from models.recompensa_model import Recompensa


class RecompensaRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="recompensas", modelo=Recompensa)

    def listar_por_conta(self, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT r.id, r.nome, r.custo_moedas, r.conta_id
                FROM recompensas r
                WHERE r.conta_id = %s
                ORDER BY r.custo_moedas ASC
            """, (conta_id,))
            resultados = cursor.fetchall()
            return [Recompensa(**linha) for linha in resultados]
        finally:
            cursor.close()