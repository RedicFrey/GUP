from models import db
from models.child_model import ChildProfile
from repositories.level_repository import LevelRepository
from exceptions import InvalidData, NotFound


class AcknowledgeLevelUpService:
    """Marca o aviso de subida de nível como visto, para não aparecer de novo."""

    def __init__(self, connection):
        self.connection = connection
        self.level_repo = LevelRepository(connection)

    def execute(self, profile_id: int, family_account_id: int, level) -> dict:
        if not isinstance(level, int) or isinstance(level, bool):
            raise InvalidData("Informe o nível que foi visto.")

        child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
        if child is None:
            raise NotFound("Perfil de criança não encontrado.")

        # nunca marca acima do nível atual, e nunca volta para trás
        new_seen = min(level, self.level_repo.find_child_level(child.id))
        if new_seen > (child.seen_level or 0):
            child.atualizar(seen_level=new_seen)
            db.session.commit()

        return {"ok": True}
