
from datetime import datetime, timedelta

from models.task_model import TaskModel
from exceptions import InvalidData
from repositories.task_repository import TaskRepository
from repositories.child_repository import ChildRepository
from repositories.task_assignment_repository import TaskAssignmentRepository
from utils.dates import parse_datetime, now_local
from utils.validators import validate_positive_int


class CreateTaskService:
    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.task_repo = TaskRepository(connection)
        self.assignment_repo = TaskAssignmentRepository(connection)

    def execute(self, data: dict, family_account_id: int, profile_id: int):
        campos_obrigatorios = ["name", "deadline", "childrenIds", "coinsReward", "xpReward"]
        for campo in campos_obrigatorios:
            if not data.get(campo):
                raise InvalidData(f"O campo '{campo}' é obrigatório.")

        children_ids = data["childrenIds"]
        if not isinstance(children_ids, list) or not children_ids:
            raise InvalidData("Selecione ao menos uma criança.")

        self._validar_criancas_da_familia(children_ids, family_account_id)

        due = parse_datetime(data.get("deadline"), "Prazo")
        if due < now_local() + timedelta(minutes=30):
            raise InvalidData("O prazo precisa ser pelo menos 30 minutos a partir de agora.")

        deadline = data["deadline"]
        if isinstance(deadline, str):
            try:
                deadline = datetime.strptime(deadline, "%Y-%m-%dT%H:%M")
            except ValueError:
                raise InvalidData("Formato de horário limite inválido.")

        coins = validate_positive_int(data.get("coinsReward"), "As moedas")
        xp = validate_positive_int(data.get("xpReward"), "O XP")

        task = TaskModel(
            name=str(data["name"]),
            description=data.get("description"),
            deadline=deadline,
            coins_reward=coins,
            xp_reward=xp,
            required_proof=bool(data.get("requiredProof")),
            created_by=profile_id,
            family_account_id=family_account_id,
        )

        try:
            task.id = self.task_repo.create(task.to_insertion())

            for child_id in children_ids:
                self.assignment_repo.create({
                    "task_id": task.id,
                    "child_profile_id": int(child_id),
                })

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return task.to_dict()

    def _validar_criancas_da_familia(self, children_ids, family_account_id):
        criancas = self.child_repo.list_family_account_children(family_account_id)
        ids_validos = {c.id for c in criancas}
        for child_id in children_ids:
            if int(child_id) not in ids_validos:
                raise InvalidData("Selecione apenas crianças da sua família.")