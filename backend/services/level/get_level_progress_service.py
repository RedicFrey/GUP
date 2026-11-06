from models.child_model import ChildProfile
from repositories.level_repository import LevelRepository
from exceptions import NotFound


class GetLevelProgressService:
    """XP da criança e quanto falta para o próximo nível (barra de progresso)."""

    def __init__(self, connection):
        self.connection = connection
        self.level_repo = LevelRepository(connection)

    def execute(self, profile_id: int, family_account_id: int) -> dict:
        child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
        if child is None:
            raise NotFound("Perfil de criança não encontrado.")

        progress = self.level_repo.find_progress(child.id)
        if progress is None:
            raise NotFound("Perfil de criança não encontrado.")

        xp, level_xp, next_xp = progress["xp"], progress["level_xp"], progress["next_level_xp"]
        if next_xp is None:
            percent = 100   # já está no nível máximo
        else:
            span = max(next_xp - level_xp, 1)
            percent = max(0, min(100, round((xp - level_xp) * 100 / span)))

        return {
            **progress,
            "xp_to_next_level": None if next_xp is None else max(next_xp - xp, 0),
            "percent": percent,
        }
