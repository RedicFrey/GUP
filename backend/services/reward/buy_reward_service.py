from models.redemption_model import RedemptionModel
from repositories.profile_repository import ProfileRepository
from repositories.reward_repository import RewardRepository
from repositories.redemption_repository import RedemptionRepository
# dps
from services.coin_history.create_coin_history_service import CoinHistoryCreationService
# dps
from exceptions import InvalidData, NotFound
 
 
class RewardBoughtService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)
        self.reward_repo = RewardRepository(connection)
        self.redemption_repo = RedemptionRepository(connection)
        self.history_service = CoinHistoryCreationService(connection)
 
    def execute(self, profile_id: int, reward_id: int):
        child = self.profile_repo.find_by_id(profile_id)
        if not child:
            raise NotFound("Criança não encontrada.")
 
        reward = self.reward_repo.find_by_id(reward_id)
        if not reward:
            raise NotFound("Recompensa não encontrada.")
 
        if child.coins < reward.amount:  
            raise InvalidData("Saldo insuficiente para essa recompensa.")
 
        try:
            novo_saldo = child.coins - reward.amount
            self.profile_repo.update(profile_id, {"coins": novo_saldo})
 
            resgate = RedemptionModel(
                name=reward.name,
                child_profile_id=profile_id,
                reward_id=reward_id,
                amount=reward.amount, 
            )
            redemption_id = self.redemption_repo.create(resgate.to_insertion())

            self.history_service.execute(
                child_profile_id=profile_id,
                amount_type="debit",
                source="redemption",
                amount=reward.amount, 
                name=f"Resgate: {reward.name}", 
            )
 
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return True