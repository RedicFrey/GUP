from models import db
from models.coin_history_model import CoinHistoryModel
from models.task_assignment_model import TaskAssignmentModel
from repositories.child_repository import ChildRepository
from repositories.level_repository import LevelRepository
from repositories.task_assignment_repository import TaskAssignmentRepository
from exceptions import InvalidData, NotFound
from utils.dates import now_local


class ApproveTaskService:
    """O responsável aprova a tarefa enviada: a criança recebe as moedas e o XP.

    Se o XP novo alcançar outro nível, a criança sobe de nível na mesma transação.
    """

    def __init__(self, connection):
        self.connection = connection
        self.assignment_repo = TaskAssignmentRepository(connection)
        self.child_repo = ChildRepository(connection)
        self.level_repo = LevelRepository(connection)

    def execute(self, assignment_id: int, family_account_id: int) -> dict:
        assignment = self.assignment_repo.find_for_update(assignment_id, family_account_id)
        if assignment is None:
            raise NotFound("Tarefa não encontrada.")
        if assignment["status"] != TaskAssignmentModel.AWAITING_APPROVAL:
            raise InvalidData("Só dá para aprovar tarefas aguardando aprovação.")

        child = self.child_repo.find_for_update(assignment["child_profile_id"], family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        coins = assignment["coins_reward"] or 0
        xp = assignment["xp_reward"] or 0
        child_fields = {}

        if coins > 0:
            child_fields["coins"] = child.add_coins(coins)

        if xp > 0:
            current_level = self.level_repo.find_child_level(child.id)
            child_fields["xp"] = child.add_xp(xp)
            reached = self.level_repo.find_level_for_xp(child.xp)
            if reached is not None and reached.level > current_level:
                child_fields["level_id"] = reached.id

        if child_fields:
            child.atualizar(**child_fields)

        TaskAssignmentModel.buscar_por_id(assignment["assignment_id"]).atualizar(
            status=TaskAssignmentModel.DONE,
            completion_date=now_local(),
            coins_earned=coins,
            xp_earned=xp,
        )

        if coins > 0:
            CoinHistoryModel(
                name=f"Tarefa concluída: {assignment['name']}",
                source=CoinHistoryModel.TASK,
                amount_type=CoinHistoryModel.CREDIT,
                amount=coins,
                child_profile_id=child.id,
            ).salvar()

        db.session.commit()
        return self.assignment_repo.find_detail(assignment_id)
