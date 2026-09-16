from repositories.conta_familia_repository import ContaFamiliaRepository
from repositories.usuario_repository import UsuarioRepository
from exceptions import NaoEncontrado

class ListarUsuarioService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.conta_familia_repo = ContaFamiliaRepository(conexao)
        self.usuario_repo = UsuarioRepository(conexao)

    def listar_usuario_por_familia(self, conta_id):
        conta_familia = self.conta_familia_repo.buscar_por_id(conta_id)
        if conta_familia is None:
            raise NaoEncontrado("Essa conta família não existe")

        try:
            usuarios = self.conta_familia_repo.buscar_membros_conta(conta_id)
        except Exception as e:
            raise NaoEncontrado("Não foi possível listar os membros") from e
        return [usuario.to_dict() for usuario in usuarios]

    def listar_usuario(self, id):
        try:
            usuario = self.usuario_repo.buscar_por_id(id)

            if usuario is None:
                raise NaoEncontrado("Usuário não existe")

        except Exception as e:
            raise NaoEncontrado("Não foi possível buscar o usuário!")

        return usuario