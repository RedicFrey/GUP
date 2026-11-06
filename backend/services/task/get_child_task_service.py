from models.child_model import ChildProfile
from repositories.task_assignment_repository import TaskAssignmentRepository
from exceptions import InvalidData, NotFound


class GetChildTaskService:
    """Detalhe da tarefa de uma criança (a criança só abre as próprias)."""

    def __init__(self, connection):
        self.connection = connection
        self.assignment_repo = TaskAssignmentRepository(connection)

    def execute(self, family_account_id: int, profile_id: int, profile_type: str,
                child_profile_id=None, task_assignment_id=None) -> dict:
        if profile_type != "responsible":
            child_profile_id = profile_id

        if child_profile_id is None:
            raise InvalidData("Informe a criança.")
        if task_assignment_id is None:
            raise InvalidData("Informe a tarefa.")

        child = ChildProfile.buscar_por_id_e_familia(child_profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        task = self.assignment_repo.find_child_assignment(task_assignment_id, child.id, family_account_id)
        if task is None:
            raise NotFound("Tarefa não encontrada.")
        return task
