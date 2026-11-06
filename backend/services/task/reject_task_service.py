from models import db
from models.task_assignment_model import TaskAssignmentModel
from repositories.task_assignment_repository import TaskAssignmentRepository
from exceptions import InvalidData, NotFound


class RejectTaskService:
    """O responsável reprova a tarefa enviada: ela volta para pendente e a criança reenvia."""

    def __init__(self, connection):
        self.connection = connection
        self.assignment_repo = TaskAssignmentRepository(connection)

    def execute(self, assignment_id: int, family_account_id: int) -> dict:
        assignment = self.assignment_repo.find_for_update(assignment_id, family_account_id)
        if assignment is None:
            raise NotFound("Tarefa não encontrada.")
        if assignment["status"] != TaskAssignmentModel.AWAITING_APPROVAL:
            raise InvalidData("Só dá para reprovar tarefas aguardando aprovação.")

        TaskAssignmentModel.buscar_por_id(assignment["assignment_id"]).atualizar(
            status=TaskAssignmentModel.PENDING,
        )

        db.session.commit()
        return self.assignment_repo.find_detail(assignment_id)
