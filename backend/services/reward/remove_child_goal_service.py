from models import db
from models.child_model import ChildProfile
from exceptions import NotFound


class RemoveChildGoalService:
    """A criança deixa de ter meta."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, profile_id: int, family_account_id: int) -> dict:
        child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        child.atualizar(goal_id=None)
        db.session.commit()
        return child.to_dict()
