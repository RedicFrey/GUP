from repositories.base_repository import BaseRepository
from models.evento_model import Evento

class EventoRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="eventos", modelo=Evento)

    def buscar_eventos_usuario(self, usuario_id):
        cursor = self.conexao.cursor(dictionary=True)
        cursor.execute("""
            SELECT e.id, e.titulo, e.data, e.usuario_id
            FROM eventos as e
            WHERE e.usuario_id = %s
        """, (usuario_id,))
        eventos = cursor.fetchall()
        cursor.close()
        return [Evento(**evento) for evento in eventos]