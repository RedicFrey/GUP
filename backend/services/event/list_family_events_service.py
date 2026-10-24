
from repositories.event_repository import EventRepository
from repositories.family_account_repository import FamilyAccountRepository
from exceptions import NotFound


class ListFamilyEventsService:
    def __init__(self, connection):
        self.connection = connection
        self.event_repo = EventRepository(connection)
        self.family_repo = FamilyAccountRepository(connection)

    def execute(self, family_account_id: int, limit: int, offset: int) -> dict:
        family_account = self.family_repo.find_by_id(family_account_id)
        if not family_account:
            raise NotFound("Não foi possível encontrar a conta família para listar os eventos")

        events, total = self.event_repo.find_events_family(family_account_id, limit, offset)

        return {
            "events": [event.to_dict() for event in events],
            "total": total,
        }