from models import db
from models.task_model import TaskModel
from exceptions import NotFound


class DeleteTaskService:
    """O responsável exclui uma tarefa da família (as atribuições saem em cascata)."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, task_id: int, family_account_id: int) -> bool:
        task = TaskModel.buscar_por_id_e_familia(task_id, family_account_id)
        if task is None:
            raise NotFound("Tarefa não encontrada.")

        task.deletar()
        db.session.commit()
        return True
