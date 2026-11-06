from models.event_model import EventModel
from repositories.base_repository import BaseRepository


class EventRepository(BaseRepository):
    """Agenda da família, paginada."""

    def list_page(self, family_account_id, limit, offset):
        total = self._buscar_valor(
            "SELECT COUNT(*) AS total FROM events WHERE family_account_id = :family_account_id",
            {"family_account_id": family_account_id},
        )

        events = self._buscar_modelos(EventModel, """
            SELECT * FROM events
            WHERE family_account_id = :family_account_id
            ORDER BY event_date ASC, id ASC
            LIMIT :limit OFFSET :offset
        """, {"family_account_id": family_account_id, "limit": limit, "offset": offset})

        return events, total
