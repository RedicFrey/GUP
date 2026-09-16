from repositories.conta_familia_repository import ContaFamiliaRepository
from exceptions import NaoEncontrado

class ListarMembrosFamiliaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.conta_repo = ContaFamiliaRepository(conexao)

    def listar_membros(self, conta_id):
        try:
            membros = self.conta_repo.buscar_membros_conta(conta_id)
        except Exception as e:
            raise NaoEncontrado("Não foi possível listar os membros") from e

        return membros