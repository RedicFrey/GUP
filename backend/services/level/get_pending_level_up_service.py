from models.child_model import ChildProfile
from repositories.level_repository import LevelRepository


class GetPendingLevelUpService:
    """Diz se a criança subiu de nível desde a última vez que viu o aviso, e o que liberou."""

    def __init__(self, connection):
        self.connection = connection
        self.level_repo = LevelRepository(connection)

    def execute(self, profile_id: int, family_account_id: int) -> dict:
        child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
        if child is None:
            return {"pending": False}   # responsável não tem nível

        seen = child.seen_level or 0
        current = self.level_repo.find_child_level(child.id)
        if current <= seen:
            return {"pending": False}

        return {
            "pending": True,
            "from_level": seen,
            "to_level": current,
            "unlocked_items": self.level_repo.find_items_unlocked(seen, current),
        }
