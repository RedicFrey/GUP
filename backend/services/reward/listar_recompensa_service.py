from backend.repositories.reward_repository import RecompensaRepository
from exceptions import NaoEncontrado

class ListarRecompensaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.recompensa_repo = RecompensaRepository(conexao)

    def listar_recompensa(self, recompensa_id):
        try:
            recompensa = self.recompensa_repo.buscar_por_id(recompensa_id)
        except Exception as e:
            raise NaoEncontrado("Não foi possível encontrar essa recompensa") from e
        return recompensa