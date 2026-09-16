from repositories.usuario_repository import UsuarioRepository
from exceptions import NaoEncontrado

class DeletarUsuarioService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.usuario_repo = UsuarioRepository(conexao)

    def deletar_usuario(self, usuario_id):
        usuario = self.usuario_repo.buscar_por_id(usuario_id)
        if usuario is None:
            raise NaoEncontrado("Usuário não encontrado.")
        
        try:
            self.usuario_repo.deletar(usuario_id)
            self.conexao.commit()

        except Exception:
            self.conexao.rollback()
            raise

        return True