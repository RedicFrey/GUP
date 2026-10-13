from repositories.child_repository import ChildRepository
from exceptions import NotFound

class ChildInfoService:
    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)

    def get(self, profile_id: int) -> dict:
        child = self.child_repo.find_by_id(profile_id)
        if not child or child.profile_type != "child":
            raise NotFound("Perfil de criança não encontrado.")

        return child.to_dict()