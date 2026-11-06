from models import db
from models.child_model import ChildProfile
from models.reward_model import RewardModel
from exceptions import NotFound


class SetChildGoalService:
    """A criança escolhe uma recompensa da família como meta."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, profile_id: int, family_account_id: int, reward_id: int) -> dict:
        child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        reward = RewardModel.buscar_por_id_e_familia(reward_id, family_account_id)
        if reward is None:
            raise NotFound("Recompensa não encontrada.")

        child.atualizar(goal_id=reward.id)
        db.session.commit()
        return child.to_dict()
