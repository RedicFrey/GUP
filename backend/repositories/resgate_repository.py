from repositories.base_repository import BaseRepository
from models.resgate_model import Resgate

class ResgateRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="resgates", modelo=Resgate)

    def listar_por_crianca(self, offset, elementos_por_pagina, crianca_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT * FROM resgates
                WHERE crianca_id = %s
                ORDER BY data_criacao DESC
                LIMIT %s
                OFFSET %s
            """, (crianca_id, elementos_por_pagina, offset))
            resultados = cursor.fetchall()
            return [Resgate(**linha) for linha in resultados]
        finally:
            cursor.close()

    def listar_todos_resgates_crianca(self, crianca_id):
        cursor = self.conexao.cursor()
        query = ("""
            SELECT COUNT(*) FROM resgates
            WHERE crianca_id = %s
        """)
        try:
            cursor.execute(query, (crianca_id,))
            resultado = cursor.fetchone()
            return resultado[0]
        finally:
            cursor.close()
