from datetime import timedelta

from repositories.task_repository import TaskRepository
from exceptions import InvalidData
from utils.dates import today_local

VALID_TYPES = (None, "today", "after")
DEFAULT_PAGE_SIZE = 6
MAX_PAGE_SIZE = 50


class ListTasksWithChildrenService:
    """Lista de tarefas da família, cada uma com as crianças e o status de cada uma.

    type=today: prazo hoje. type=after: de amanhã em diante. Sem type: todas.
    """

    def __init__(self, connection):
        self.task_repo = TaskRepository(connection)

    def execute(self, family_account_id: int, type_=None, page=1, size=DEFAULT_PAGE_SIZE) -> dict:
        if type_ not in VALID_TYPES:
            raise InvalidData("Tipo inválido. Use 'today' ou 'after'.")

        today = today_local()
        return self.task_repo.list_page_with_children(
            family_account_id,
            deadline_on=today if type_ == "today" else None,
            deadline_from=today + timedelta(days=1) if type_ == "after" else None,
            page=max(1, page or 1),
            size=min(max(1, size or DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
        )
