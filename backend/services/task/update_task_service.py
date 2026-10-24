from datetime import datetime, timedelta

from exceptions import InvalidData
from models.task_assignment_model import TaskAssignmentModel
from repositories.task_assignment_repository import TaskAssignmentRepository
from repositories.task_repository import TaskRepository

MIN_DEADLINE_MINUTES = 30   # mesma regra do front (minDeadlineValue)

ALLOWED_KEYS = {
    "name", "description", "deadline", "requiredProof",
    "coinsReward", "xpReward", "childrenIds",
}


class TaskNotFoundError(Exception):
    pass


class UpdateTaskService:
    def __init__(self, connection):
        self.connection = connection
        self.tasks = TaskRepository(connection)
        self.assignments = TaskAssignmentRepository(connection)

    def execute(self, task_id, data, family_account_id):
        unknown = set(data) - ALLOWED_KEYS
        if unknown:
            raise InvalidData(f"Campos inválidos: {', '.join(sorted(unknown))}")

        try:
            task = self.tasks.find_for_update(task_id, family_account_id)
            if not task:
                raise TaskNotFoundError("Tarefa não encontrada.")

            # 1) valida tudo, sem escrever nada
            columns = self._validate_columns(data, task)
            to_add, to_remove = self._plan_children(task_id, data, family_account_id)

            # 2) só depois escreve
            if columns:
                self.tasks.update(task_id, columns)
            for child_id in to_add:
                self.assignments.create(TaskAssignmentModel(task_id, child_id).to_insertion())
            for assignment_id in to_remove:
                self.assignments.delete(assignment_id)

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return self.tasks.find_with_children(task_id, family_account_id)

    # ---------- colunas da tabela tasks ----------
    def _validate_columns(self, data, task):
        columns = {}

        if "name" in data:
            columns["name"] = _text(data["name"], "Nome", required=True)

        if "description" in data:
            columns["description"] = _text(data["description"], "Descrição", required=False)

        if "requiredProof" in data:
            if not isinstance(data["requiredProof"], bool):
                raise InvalidData("Foto obrigatória inválida.")
            columns["required_proof"] = data["requiredProof"]

        if "coinsReward" in data:
            columns["coins_reward"] = _positive_int(data["coinsReward"], "Moedas")

        if "xpReward" in data:
            columns["xp_reward"] = _positive_int(data["xpReward"], "XP")

        if "deadline" in data:
            deadline = _parse_deadline(data["deadline"])
            if deadline != task["deadline"]:   # igual ao atual não conta como mudança
                limit = datetime.now() + timedelta(minutes=MIN_DEADLINE_MINUTES)
                if deadline < limit:
                    raise InvalidData(
                        f"O horário limite precisa ser pelo menos {MIN_DEADLINE_MINUTES} minutos à frente."
                    )
                columns["deadline"] = deadline

        return columns

    # ---------- crianças da tarefa ----------
    def _plan_children(self, task_id, data, family_account_id):
        """Devolve (ids para adicionar, ids de assignments para remover)."""
        if "childrenIds" not in data:
            return [], []

        wanted = _parse_children_ids(data["childrenIds"])
        current = {a["child_profile_id"]: a for a in self.assignments.list_by_task(task_id)}

        to_add = wanted - set(current)
        to_remove = [a for child_id, a in current.items() if child_id not in wanted]

        if to_add:
            valid = set(self.assignments.find_family_children(family_account_id, list(to_add)))
            if valid != to_add:
                raise InvalidData("Uma das crianças selecionadas não pertence à sua família.")

        # quem já enviou ou concluiu não pode ser removido (perderia o histórico)
        locked = [a["child_name"] for a in to_remove
                  if a["status"] != TaskAssignmentModel.PENDING]
        if locked:
            raise InvalidData(
                f"Não é possível remover {', '.join(locked)}: a tarefa já foi enviada ou concluída."
            )

        return to_add, [a["assignment_id"] for a in to_remove]


# ---------- validações ----------
def _text(value, field, required):
    if not isinstance(value, str):
        raise InvalidData(f"{field} inválido.")
    value = value.strip()
    if required and not value:
        raise InvalidData(f"{field} é obrigatório.")
    return value or None


def _positive_int(value, field):
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise InvalidData(f"{field} inválido.")
    return value


def _parse_deadline(value):
    try:
        return datetime.fromisoformat(value)   # aceita "2026-10-25T19:20"
    except (TypeError, ValueError):
        raise InvalidData("Horário limite inválido.")


def _parse_children_ids(value):
    if not isinstance(value, list) or not value:
        raise InvalidData("Selecione ao menos uma criança.")
    try:
        return {int(v) for v in value}         # o front manda strings
    except (TypeError, ValueError):
        raise InvalidData("Lista de crianças inválida.")