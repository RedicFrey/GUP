from repositories.task_repository import TaskRepository
from exceptions import NotFound


class GetTaskService:
    """Detalhe de uma tarefa da família, com as crianças e o status de cada uma."""

    def __init__(self, connection):
        self.task_repo = TaskRepository(connection)

    def execute(self, task_id: int, family_account_id: int) -> dict:
        task = self.task_repo.find_with_children(task_id, family_account_id)
        if task is None:
            raise NotFound("Tarefa não encontrada.")
        return task
