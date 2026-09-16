from models.conta_familia_model import ContaFamilia
from models.usuario_model import Usuario
from repositories.base_repository import BaseRepository

class ContaFamiliaRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="contas_familia", modelo=ContaFamilia)

    def buscar_membros_conta(self, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT u.id, u.nome, u.email, u.data_nasc, u.conta_id, u.tipo_usuario
                FROM usuarios u
                JOIN contas_familia cf ON u.conta_id = cf.id
                WHERE cf.id = %s
                ORDER BY u.nome ASC
            """, (conta_id,))
            resultados = cursor.fetchall()
            return [Usuario(**linha) for linha in resultados]
        finally:
            cursor.close()

    def buscar_lider_conta(self, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT u.id, u.nome, u.email, u.data_nasc, u.conta_id, u.tipo_usuario
                FROM usuarios u
                JOIN contas_familia cf ON u.conta_id = cf.id
                WHERE cf.id = %s AND u.email = cf.email_dono
            """, (conta_id,))
            resultado = cursor.fetchone()
            return Usuario(**resultado) if resultado else None
        finally:
            cursor.close()

    def buscar_por_email(self, email_dono):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM contas_familia WHERE email_dono = %s",
                (email_dono,)
            )
            resultado = cursor.fetchone()
            return ContaFamilia(**resultado) if resultado else None
        finally:
            cursor.close()