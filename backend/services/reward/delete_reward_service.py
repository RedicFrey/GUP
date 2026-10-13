from repositories.reward_repository import RewardRepository
from exceptions import InvalidData

class DeleteRewardService:
    def __init__(self, connection):
        self.connection = connection
        self.reward_repo = RewardRepository(connection)

    def execute(self, recompensa_id: int, family_account_id: int):
        reward = self.reward_repo.find_by_id(recompensa_id)
        if reward is None:
            raise InvalidData("Recompensa não encontrada.")

        try:
            self.reward_repo.delete(recompensa_id)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise ValueError(
                "Não foi possível deletar: essa recompensa ainda está definida "
                "como meta de alguma criança ou já foi resgatada."
            )

        return True