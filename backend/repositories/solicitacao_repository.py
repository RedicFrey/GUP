from repositories.base_repository import BaseRepository
from models.solicitacao_model import Solicitacao


class SolicitacaoRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="solicitacoes_familia", modelo=Solicitacao)

    def listar_pendentes_por_conta(self, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT * FROM solicitacoes_familia
                WHERE conta_id = %s AND status = 'pendente'
                ORDER BY data_criacao ASC
            """, (conta_id,))
            resultados = cursor.fetchall()
            return [Solicitacao(**linha) for linha in resultados]
        finally:
            cursor.close()

    def buscar_pendente_por_usuario_e_conta(self, usuario_id, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT * FROM solicitacoes_familia
                WHERE usuario_id = %s AND conta_id = %s AND status = 'pendente'
            """, (usuario_id, conta_id))
            resultado = cursor.fetchone()
            return Solicitacao(**resultado) if resultado else None
        finally:
            cursor.close()

    def buscar_ultima_por_usuario(self, usuario_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT * FROM solicitacoes_familia
                WHERE usuario_id = %s
                ORDER BY data_criacao DESC
                LIMIT 1
            """, (usuario_id,))
            resultado = cursor.fetchone()
            return Solicitacao(**resultado) if resultado else None
        finally:
            cursor.close()