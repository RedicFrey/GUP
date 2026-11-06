from repositories.child_repository import ChildRepository


class ListChildrenService:
    """Crianças da conta família (filtros de criança nas telas)."""

    def __init__(self, connection):
        self.child_repo = ChildRepository(connection)

    def execute(self, family_account_id: int) -> list:
        return [child.to_dict() for child in self.child_repo.list_by_family(family_account_id)]
