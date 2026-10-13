from repositories.profile_repository import ProfileRepository
from repositories.reward_repository import RewardRepository
from exceptions import NotFound

class GoalSetService():
    def __init__(self, connection):
            self.connection = connection
            self.profile_repo = ProfileRepository(connection)
            self.reward_repo = RewardRepository(connection)
    
    def execute(self, profile_id: int, reward_id: int):
        child = self.profile_repo.find_by_id(profile_id)
        if not child:
            raise NotFound("Criança não encontrada.")
    
        reward = self.reward_repo.find_by_id(reward_id)
        if not reward:
            raise NotFound("Recompensa não encontrada.")
    
        try:
            self.profile_repo.update(profile_id, {"goal_id": reward.id})
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
    
        return self.profile_repo.find_by_id(profile_id).to_dict()