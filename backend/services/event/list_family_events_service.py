from repositories.event_repository import EventRepository

DEFAULT_PER_PAGE = 7
MAX_PER_PAGE = 50


class ListFamilyEventsService:
    """Agenda da família, paginada (todos os perfis veem)."""

    def __init__(self, connection):
        self.event_repo = EventRepository(connection)

    def execute(self, family_account_id: int, page=None, per_page=None) -> dict:
        page = max(page or 1, 1)
        per_page = min(max(per_page or DEFAULT_PER_PAGE, 1), MAX_PER_PAGE)

        events, total = self.event_repo.list_page(family_account_id, per_page, (page - 1) * per_page)

        return {
            "events": [event.to_dict() for event in events],
            "total": total,
            "page": page,
            "per_page": per_page,
        }
