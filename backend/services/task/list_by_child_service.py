from repositories.task_repository import TaskRepository
from repositories.child_repository import ChildRepository
from exceptions import NotFound, InvalidData

class ListTasksByChildService:
    def __init__(self, connection):
        self.task_repo = TaskRepository(connection)
        self.child_repo = ChildRepository(connection)

    def execute(self, family_account_id, profile_id, profile_type,
                child_profile_id, task_assignment_id) -> list:

        if profile_type != "responsible":
            child_profile_id = profile_id

        if child_profile_id is None:
            raise InvalidData("Informe a criança.")

        child = self.child_repo.find_by_id(child_profile_id)
        if not child or child.family_account_id != family_account_id:
            raise NotFound("Criança não encontrada.")

        return self.task_repo.list_by_child(task_assignment_id, child_profile_id, family_account_id)