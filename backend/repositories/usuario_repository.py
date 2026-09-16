from repositories.base_repository import BaseRepository
from models.usuario_model import Usuario

class UsuarioRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="usuarios", modelo=Usuario)

    def buscar_por_email(self, email):
        cursor = self.conexao.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
            resultado = cursor.fetchone()
            return Usuario(**resultado) if resultado else None
        finally:
            cursor.close()