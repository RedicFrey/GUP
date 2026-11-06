from models.task_assignment_model import TaskAssignmentModel
from repositories.task_assignment_repository import TaskAssignmentRepository
from exceptions import InvalidData

DEFAULT_PAGE_SIZE = 6
MAX_PAGE_SIZE = 50
FILTER_STATUSES = (*TaskAssignmentModel.STATUSES, TaskAssignmentModel.LATE)


class ListTasksService:
    """Painel de tarefas: uma linha por criança, com filtro de status, criança e período.

    Sem período, mostra as de hoje. period=after mostra de amanhã em diante.
    A criança só vê as próprias.
    """

    def __init__(self, connection):
        self.assignment_repo = TaskAssignmentRepository(connection)

    def execute(self, family_account_id: int, profile_id: int, profile_type: str,
                status=None, period=None, child_profile_id=None,
                page=1, size=DEFAULT_PAGE_SIZE) -> dict:
        if status is not None and status not in FILTER_STATUSES:
            raise InvalidData(f"Status inválido: {status}")

        if profile_type != "responsible":
            child_profile_id = profile_id

        filters = {
            "family_account_id": family_account_id,
            "status": status,
            "child_profile_id": child_profile_id,
            "from_tomorrow": period == "after",
        }
        page = max(1, page or 1)
        size = min(max(1, size or DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)

        return {
            "tasks": self.assignment_repo.list_with_status(**filters, page=page, size=size),
            "total": self.assignment_repo.count_with_status(**filters),
        }
