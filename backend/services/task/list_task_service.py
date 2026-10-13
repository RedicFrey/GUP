from repositories.task_assignment_repository import TaskAssignmentRepository
from repositories.child_repository import ChildRepository
from repositories.profile_repository import ProfileRepository
from datetime import date, timedelta
from exceptions import NotFound, InvalidData

VALID_TYPES = (None, "today", "after")

class GetTaskService:
    def __init__(self, connection):
        self.task_repo = TaskAssignmentRepository(connection)
        self.child_repo = ChildRepository(connection)
        self.profile_repo = ProfileRepository(connection)

    def execute(self, family_account_id: int, profile_id: int, task_id: int | None = None,
        type_: str | None = None):
        print(type_)

        profile = self.profile_repo.find_by_id(profile_id)
        if not profile or profile.family_account_id != family_account_id:
            raise NotFound("Perfil não encontrado.")
        
        if type_ not in VALID_TYPES:
            raise InvalidData("Tipo inválido. Use 'today' ou 'after'.")
        
        today = date.today()
        deadline_on = today if type_ == "today" else None
        deadline_from = today + timedelta(days=1) if type_ == "after" else None
        
        tasks = self.task_repo.list_task(
            family_account_id, task_id,
            deadline_on=deadline_on, deadline_from=deadline_from,
        )
        
        if task_id and not tasks:
            raise NotFound("Tarefa não encontrada.")
    
        return tasks
