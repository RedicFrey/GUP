
from repositories.child_repository import ChildRepository
from repositories.family_account_repository import FamilyAccountRepository
from exceptions import NotFound


class GetChildInfoService:
    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.family_repo = FamilyAccountRepository(connection)

    def get(self, profile_id: int, family_account_id: int) -> dict:
        child = self.child_repo.find_by_id(profile_id)
        family = self.family_repo.find_by_id(family_account_id)

        if child.family_account_id != family.id:
            raise NotFound("Não foi possível encontrar esse perfil")

        if not child or child.profile_type != "child":
            raise NotFound("Perfil de criança não encontrado.")

        return child.to_dict()