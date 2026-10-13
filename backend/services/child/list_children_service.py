from repositories.child_repository import ChildRepository
from repositories.family_account_repository import FamilyAccountRepository
from exceptions import NotFound

class FamilySChildren():
    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.family_repo = FamilyAccountRepository(connection)

    def execute(self, family_account_id: int) -> dict:
        family_account = self.family_repo.find_by_id(family_account_id)
        if not  family_account:
            raise NotFound("Conta família não encontrada para listar as crianças")

        children = self.child_repo.list_family_account_children(family_account_id)

        print(children)
        return [child.to_dict() for child in children]

    