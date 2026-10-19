from repositories.task_assignment_repository import TaskAssignmentRepository
from repositories.child_repository import ChildRepository
from repositories.profile_repository import ProfileRepository
from datetime import date, timedelta
from exceptions import NotFound, InvalidData

VALID_TYPES = (None, "today", "after")
MAX_PAGE_SIZE = 50
class GetTaskService:
    def __init__(self, connection):
        self.task_repo = TaskAssignmentRepository(connection)
        self.child_repo = ChildRepository(connection)
        self.profile_repo = ProfileRepository(connection)

    def execute(self, family_account_id: int, profile_id: int, task_id: int | None = None,
        type_: str | None = None, page: int = 1, size: int = 6):

        profile = self.profile_repo.find_by_id(profile_id)
        if not profile or profile.family_account_id != family_account_id:
            raise NotFound("Perfil não encontrado.")

        if type_ not in VALID_TYPES:
            raise InvalidData("Tipo inválido. Use 'today' ou 'after'.")

        today = date.today()
        deadline_on = today if type_ == "today" else None
        deadline_from = today + timedelta(days=1) if type_ == "after" else None

        # uma tarefa só (detalhes): sem paginação
        if task_id:
            task = self.task_repo.list_task(
                family_account_id, task_id,
                deadline_on=deadline_on, deadline_from=deadline_from,
            )
            if not task:
                raise NotFound("Tarefa não encontrada.")
            return task

        return self.task_repo.list_task_page(
            family_account_id,
            deadline_on=deadline_on, deadline_from=deadline_from,
            page=max(1, page or 1),
            size=min(max(1, size or 6), MAX_PAGE_SIZE),
        )

# MAX_PAGE_SIZE = 50

# def execute(self, family_account_id: int, profile_id: int, task_id: int | None = None,
#     type_: str | None = None, page: int = 1, size: int = 6):

#     profile = self.profile_repo.find_by_id(profile_id)
#     if not profile or profile.family_account_id != family_account_id:
#             raise NotFound("Perfil não encontrado.")

#     if type_ not in VALID_TYPES:
#         raise InvalidData("Tipo inválido. Use 'today' ou 'after'.")

#     today = date.today()
#     deadline_on = today if type_ == "today" else None
#     deadline_from = today + timedelta(days=1) if type_ == "after" else None

#     # uma tarefa só (detalhes): sem paginação
#     if task_id:
#         task = self.task_repo.list_task(
#             family_account_id, task_id,
#             deadline_on=deadline_on, deadline_from=deadline_from,
#         )
#         if not task:
#             raise NotFound("Tarefa não encontrada.")
#         return task

#     return self.task_repo.list_task_page(
#         family_account_id,
#         deadline_on=deadline_on, deadline_from=deadline_from,
#         page=max(1, page or 1),
#         size=min(max(1, size or 6), MAX_PAGE_SIZE),
#     )
