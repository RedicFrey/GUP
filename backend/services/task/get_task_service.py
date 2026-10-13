
from repositories.task_repository import TaskRepository

class FindTaskService():
    def __init__(self, connection):
        self.task_repo = TaskRepository(connection)

    def execute(self, task_id: int, family_account_id: int) -> object:
        task = self.task_repo.find_with_children(task_id, family_account_id)
        return task
