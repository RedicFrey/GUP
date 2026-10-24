
from repositories.redemption_repository import RedemptionRepository
from repositories.child_repository import ChildRepository
from exceptions import NotFound


class ListRedemptionsByChildService:
    def __init__(self, conexao):
        self.redemption_repo = RedemptionRepository(conexao)
        self.child_repo = ChildRepository(conexao)

    def execute(self, offset, elements_by_page, child_id, profile_id, profile_type):
        if profile_type == "child":
            child_id = profile_id
        child = self.child_repo.find_by_id(child_id)
        if child is None:
            raise NotFound("Não foi possível encontrar a criança.")
 
        redemptions = self.redemption_repo.list_by_child(offset, elements_by_page, child_id)
        elements = self.redemption_repo.count_by_child_redemption(child_id)
 
        return {
            "redemptions": [r.to_dict() for r in redemptions],
            "elements": elements,
        }