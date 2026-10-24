
from datetime import datetime, timedelta

from repositories.task_assignment_repository import TaskAssignmentRepository
from models.task_assignment_model import TaskAssignmentModel
from exceptions import InvalidData

MAX_PAGE_SIZE = 50


class ListTaskService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.task_repo = TaskAssignmentRepository(conexao)

    def execute(
        self, family_account_id: int, profile_id: int, status: str | None,
        profile_type: str | None, child_profile_id: int | None, period: str | None,
        page: int = 1, size: int = 6,
    ) -> dict:

        if status is not None and status != "late":
            TaskAssignmentModel.verify_status(status)

        if profile_type is None:
            raise InvalidData("Tipo de perfil não identificado para retornar tarefa.")

        if profile_type != "responsible":
            child_profile_id = profile_id

        data = {
            "family_account_id": family_account_id,
            "child_profile_id": child_profile_id,
            "status": status,
            "page": max(1, page or 1),
            "size": min(max(1, size or 6), MAX_PAGE_SIZE),   # nunca deixa pedir tudo de uma vez
        }

        if period == "after":
            tomorrow = datetime.now() + timedelta(days=1)
            data["period"] = tomorrow.strftime("%Y-%m-%d")
        else:
            period = None

        try:
            return {
                "tasks": self.task_repo.list_by_account_with_status(data),
                "total": self.task_repo.count_by_account_with_status(data),
            }
        except ValueError as e:
            raise InvalidData("Não foi possível listar as tarefas.") from e

    # family_account_id=session["family_account_id"],
    #         profile_id=session["profile_id"],
    #         profile_type=session["profile_type"],
    #         status=status, period=period, child_id=child_id,