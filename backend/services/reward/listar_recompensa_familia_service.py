from backend.repositories.reward_repository import RecompensaRepository

class RewardsByFamilyFamiliaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.recompensa_repo = RecompensaRepository(conexao)

    def listar(self, conta_id):
        recompensas = self.recompensa_repo.listar_por_conta(conta_id)
        return [r.to_dict() for r in recompensas]