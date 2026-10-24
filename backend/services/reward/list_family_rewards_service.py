from repositories.reward_repository import RewardRepository
from repositories.family_account_repository import FamilyAccountRepository
from exceptions import NotFound

class ListFamilyRewardsService:
    def __init__(self, connection):
        self.reward_repo = RewardRepository(connection)
        self.family_repo = FamilyAccountRepository(connection)

    def list(self, family_account_id: int) -> list:
        family_account = self.family_repo.find_by_id(family_account_id)
        if not family_account:
            raise NotFound("Não foi encontrado a conta família, e por isso não pode ser listado as recompensa")

        rewards = self.reward_repo.list_by_family_account(family_account_id)
        return [r.to_dict() for r in rewards]