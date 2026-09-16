from repositories.evento_repository import EventoRepository
from exceptions import NaoEncontrado

class ListarEventoUsuarioService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.evento_repo = EventoRepository(conexao)

    def listar_eventos_usuario(self, usuario_id):

        try:
            eventos = self.evento_repo.buscar_eventos_usuario(usuario_id)

        except Exception as e:
            raise NaoEncontrado("Não foi possível listar os eventos") from e
        
        return [evento.to_dict() for evento in eventos]