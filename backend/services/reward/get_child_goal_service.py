from models.child_model import ChildProfile
from models.reward_model import RewardModel
from exceptions import NotFound


class GetChildGoalService:
    """Meta da criança logada e o saldo atual, para o cartão de progresso."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, profile_id: int, family_account_id: int) -> dict:
        child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        reward = None
        if child.goal_id:
            reward = RewardModel.buscar_por_id_e_familia(child.goal_id, family_account_id)

        return {
            "reward_id": reward.id if reward else None,
            "reward_name": reward.name if reward else None,
            "reward_amount": reward.amount if reward else None,
            "child_profile_id": child.id,
            "child_coins": child.coins,
        }
