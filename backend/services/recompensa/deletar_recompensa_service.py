from repositories.recompensa_repository import RecompensaRepository
from exceptions import DadosInvalidos

class DeletarRecompensaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.recompensa_repo = RecompensaRepository(conexao)

    def deletar(self, recompensa_id):
        recompensa = self.recompensa_repo.buscar_por_id(recompensa_id)
        if recompensa is None:
            raise DadosInvalidos("Recompensa não encontrada.")

        try:
            self.recompensa_repo.deletar(recompensa_id)
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise ValueError(
                "Não foi possível deletar: essa recompensa ainda está definida "
                "como meta de alguma criança ou já foi resgatada."
            )

        return True