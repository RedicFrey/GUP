from datetime import timedelta

from models import db
from models.task_model import TaskModel
from models.task_assignment_model import TaskAssignmentModel
from repositories.child_repository import ChildRepository
from repositories.task_assignment_repository import TaskAssignmentRepository
from repositories.task_repository import TaskRepository
from exceptions import InvalidData, NotFound
from utils.dates import parse_datetime, now_local
from utils.validators import validate_id_list, validate_positive_int, validate_text

ALLOWED_KEYS = {
    "name", "description", "deadline", "requiredProof",
    "coinsReward", "xpReward", "childrenIds",
}


class UpdateTaskService:
    """O responsável edita uma tarefa da família e as crianças dela.

    Uma criança que já enviou ou concluiu a tarefa não pode ser removida.
    """

    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.assignment_repo = TaskAssignmentRepository(connection)
        self.task_repo = TaskRepository(connection)

    def execute(self, task_id: int, family_account_id: int, data: dict) -> dict:
        if not data:
            raise InvalidData("Envie os dados que deseja alterar.")

        unknown = set(data) - ALLOWED_KEYS
        if unknown:
            raise InvalidData(f"Campos inválidos: {', '.join(sorted(unknown))}")

        task = TaskModel.buscar_por_id_e_familia(task_id, family_account_id)
        if task is None:
            raise NotFound("Tarefa não encontrada.")

        columns = self._columns(data, task)
        to_add, to_remove = self._children_changes(task.id, data, family_account_id)

        if columns:
            task.atualizar(**columns)
        for child_id in sorted(to_add):
            TaskAssignmentModel(task_id=task.id, child_profile_id=child_id).salvar()
        for assignment in to_remove:
            TaskAssignmentModel.buscar_por_id(assignment["assignment_id"]).deletar()

        db.session.commit()
        return self.task_repo.find_with_children(task.id, family_account_id)

    @staticmethod
    def _columns(data, task):
        columns = {}

        if "name" in data:
            columns["name"] = validate_text(data["name"], "O nome", max_length=TaskModel.MAX_NAME_LENGTH)

        if "description" in data:
            columns["description"] = validate_text(
                data["description"], "A descrição",
                max_length=TaskModel.MAX_DESCRIPTION_LENGTH, required=False,
            )

        if "requiredProof" in data:
            if not isinstance(data["requiredProof"], bool):
                raise InvalidData("Foto obrigatória inválida.")
            columns["required_proof"] = data["requiredProof"]

        if "coinsReward" in data:
            columns["coins_reward"] = validate_positive_int(data["coinsReward"], "As moedas")

        if "xpReward" in data:
            columns["xp_reward"] = validate_positive_int(data["xpReward"], "O XP")

        if "deadline" in data:
            deadline = parse_datetime(data["deadline"], "Prazo")
            if deadline != task.deadline:
                limit = now_local() + timedelta(minutes=TaskModel.MIN_DEADLINE_MINUTES)
                if deadline < limit:
                    raise InvalidData(
                        f"O prazo precisa ser pelo menos {TaskModel.MIN_DEADLINE_MINUTES} minutos à frente."
                    )
                columns["deadline"] = deadline

        return columns

    def _children_changes(self, task_id, data, family_account_id):
        if "childrenIds" not in data:
            return set(), []

        wanted = validate_id_list(data["childrenIds"])
        current = {a["child_profile_id"]: a for a in self.assignment_repo.list_by_task(task_id)}

        to_add = wanted - set(current)
        to_remove = [a for child_id, a in current.items() if child_id not in wanted]

        if self.child_repo.find_ids_in_family(family_account_id, to_add) != to_add:
            raise InvalidData("Uma das crianças selecionadas não pertence à sua família.")

        # quem já enviou ou concluiu não pode ser removido (perderia o histórico)
        locked = [a["child_name"] for a in to_remove if a["status"] != TaskAssignmentModel.PENDING]
        if locked:
            raise InvalidData(
                f"Não é possível remover {', '.join(locked)}: a tarefa já foi enviada ou concluída."
            )

        return to_add, to_remove
