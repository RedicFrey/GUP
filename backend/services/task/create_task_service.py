from datetime import timedelta

from models import db
from models.task_model import TaskModel
from models.task_assignment_model import TaskAssignmentModel
from repositories.child_repository import ChildRepository
from exceptions import InvalidData
from utils.dates import parse_datetime, now_local
from utils.validators import validate_id_list, validate_positive_int, validate_text

REQUIRED_FIELDS = ("name", "deadline", "childrenIds", "coinsReward", "xpReward")


class CreateTaskService:
    """O responsável cria uma tarefa para uma ou mais crianças da família."""

    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)

    def execute(self, family_account_id: int, profile_id: int, data: dict) -> dict:
        if not data:
            raise InvalidData("Envie os dados da tarefa.")
        for field in REQUIRED_FIELDS:
            if not data.get(field):
                raise InvalidData(f"O campo '{field}' é obrigatório.")

        name = validate_text(data["name"], "O nome da tarefa", max_length=TaskModel.MAX_NAME_LENGTH)
        description = validate_text(
            data.get("description"), "A descrição",
            max_length=TaskModel.MAX_DESCRIPTION_LENGTH, required=False,
        )

        deadline = parse_datetime(data["deadline"], "Prazo")
        if deadline < now_local() + timedelta(minutes=TaskModel.MIN_DEADLINE_MINUTES):
            raise InvalidData(
                f"O prazo precisa ser pelo menos {TaskModel.MIN_DEADLINE_MINUTES} minutos a partir de agora."
            )

        coins = validate_positive_int(data["coinsReward"], "As moedas")
        xp = validate_positive_int(data["xpReward"], "O XP")

        children_ids = validate_id_list(data["childrenIds"])
        if self.child_repo.find_ids_in_family(family_account_id, children_ids) != children_ids:
            raise InvalidData("Selecione apenas crianças da sua família.")

        task = TaskModel(
            name=name,
            description=description,
            deadline=deadline,
            coins_reward=coins,
            xp_reward=xp,
            required_proof=bool(data.get("requiredProof")),
            created_by=profile_id,
            family_account_id=family_account_id,
        )
        task.salvar()

        for child_id in sorted(children_ids):
            TaskAssignmentModel(task_id=task.id, child_profile_id=child_id).salvar()

        db.session.commit()
        return task.to_dict()
