
from repositories.task_repository import TaskRepository


class DeleteTaskService:
    def __init__(self, connection):
        self.connection = connection
        self.task_repo = TaskRepository(connection)

    def execute(self, tarefa_id):
        task = self.task_repo.find_by_id(tarefa_id)
        if task is None:
            raise ValueError("Tarefa não encontrada.")

        try:
            self.task_repo.delete(tarefa_id)
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            raise ValueError("Não foi possível deletar essa tarefa") from e

        return True