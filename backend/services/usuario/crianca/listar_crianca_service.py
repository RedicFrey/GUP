from repositories.crianca_repository import CriancaRepository
from exceptions import NaoEncontrado

class ListarCriancaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)

    def listar_crianca(self, crianca_id):
        try:
            crianca = self.crianca_repo.buscar_por_id(crianca_id)
        except ValueError as e:
            raise NaoEncontrado("Não foi possível encontrar a criança")
        return crianca
        