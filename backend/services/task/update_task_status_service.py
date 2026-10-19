import logging
from datetime import datetime
from repositories.task_assignment_repository import TaskAssignmentRepository
from repositories.child_repository import ChildRepository
from services.coin_history.create_coin_history_service import CoinHistoryCreationService
from exceptions import InvalidData, NotFound

logger = logging.getLogger(__name__)

STATUS_VALIDOS = {"pending", "awaiting_approval", "done", "not_done"}


class UpdateTaskStatusService:
    def __init__(self, connection):
        self.connection = connection
        self.assignment_repo = TaskAssignmentRepository(connection)
        self.child_repo = ChildRepository(connection)
        self.history_service = CoinHistoryCreationService(connection)

    def execute(self, assignment_id, new_status, profile_id, profile_type,
                family_account_id, proof_photo=None):
        new_status = (new_status or "").lower()
        if new_status not in STATUS_VALIDOS:
            raise InvalidData("Status inválido.")

        try:
            assignment = self.assignment_repo.find_for_update(assignment_id)
            if not assignment or assignment["family_account_id"] != family_account_id:
                raise NotFound("Não foi possível encontrar a tarefa.")

            if assignment["status"] == "done":
                raise InvalidData("Esta tarefa já foi concluída e as moedas já foram pagas.")

            if profile_type == "child":                  
                if assignment["child_profile_id"] != profile_id:
                    raise InvalidData("Essa tarefa não é sua.")
                if new_status != "awaiting_approval":
                    raise InvalidData("A criança só pode enviar a tarefa para análise.")
                if assignment["status"] == "awaiting_approval":
                    raise InvalidData("Esta tarefa já foi enviada para análise.")
                if assignment["required_proof"] and not proof_photo:
                    raise InvalidData("Envie uma foto como comprovação.")
            elif profile_type == "responsible":
                if assignment["status"] != "awaiting_approval":
                    raise InvalidData("Só dá para avaliar tarefas aguardando aprovação.")
                if new_status not in ("done", "pending"):
                    raise InvalidData("O responsável só pode aprovar ou recusar.")
            else:
                raise InvalidData("Tipo de perfil inválido.")

            now = datetime.now()

            self.assignment_repo.update_status(
                assignment_id,
                new_status,
                proof_photo=proof_photo,
                completion_date=now if new_status == "done" else None,
                submitted_at=now if new_status == "awaiting_approval" else None, 
            )

            if new_status == "done":
                self._pay_reward(assignment)

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return self.assignment_repo.find_detail(assignment_id)

    def _pay_reward(self, assignment):
        child_id = assignment["child_profile_id"]

        # só moedas aqui: o XP (e o nível) ficam com o level_service
        self.child_repo.add_coins(child_id, assignment["coins_reward"], 0)

        self.history_service.execute(
            child_profile_id=child_id,
            source="task",
            amount=assignment["coins_reward"],
            amount_type="credit",
            name=f"Tarefa concluída: {assignment['name']}",
        )

        xp = assignment["xp_reward"]
        if xp and xp > 0:
            self.level_service.add_xp(child_id, xp)
        