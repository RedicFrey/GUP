from repositories.base_repository import BaseRepository
from models.event_model import EventModel


class EventRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="events", model=EventModel)

    # Devolve (eventos da página, total de eventos da família)
    def find_events_family(self, family_account_id, limit, offset):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT COUNT(*) AS total FROM events WHERE family_account_id = %s",
                (family_account_id,),
            )
            total = cursor.fetchone()["total"]

            # o id desempata eventos na mesma data, senão uma página repete ou perde itens
            cursor.execute("""
                SELECT e.id, e.name, e.event_date, e.family_account_id, e.created_by
                FROM events AS e
                WHERE e.family_account_id = %s
                ORDER BY e.event_date ASC, e.id ASC
                LIMIT %s OFFSET %s
            """, (family_account_id, limit, offset))
            events = [EventModel(**row) for row in cursor.fetchall()]
        finally:
            cursor.close()

        return events, total
    