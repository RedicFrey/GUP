from repositories.child_repository import ChildRepository
from repositories.reward_repository import RewardRepository
from exceptions import NotFound

class GetChildGoalService:
    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.reward_repo = RewardRepository(connection)

    def execute(self, child_profile_id: int) -> dict:
        child = self.child_repo.find_by_id(child_profile_id)
        if not child:
            raise NotFound("Criança não encontrada.")

        goal = self.reward_repo.find_goal_by_child(child_profile_id)

        # sem meta escolhida o join não devolve linha: manda os campos da recompensa vazios
        if not goal:
            return {
                "reward_id": None,
                "reward_name": None,
                "reward_amount": None,
                "child_profile_id": child_profile_id,
                "child_coins": child.coins,
            }

        return goal