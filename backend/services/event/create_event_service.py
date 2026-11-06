from models import db
from models.event_model import EventModel
from models.notification_preference_model import NotificationPreferenceModel
from services.notification.notify_responsibles_service import NotifyResponsiblesService
from exceptions import InvalidData
from utils.dates import parse_date, today_local
from utils.validators import validate_text


class CreateEventService:
    """O responsável cria um evento na agenda da família (data de hoje em diante)."""

    def __init__(self, connection):
        self.connection = connection
        self.notify_service = NotifyResponsiblesService(connection)

    def execute(self, family_account_id: int, profile_id: int, data: dict) -> dict:
        if not data:
            raise InvalidData("Envie os dados do evento.")

        name = validate_text(data.get("name"), "Nome do evento", max_length=EventModel.MAX_NAME_LENGTH)
        if not data.get("eventDate"):
            raise InvalidData("A data do evento é obrigatória.")

        event_date = parse_date(data["eventDate"], "Data do evento")
        if event_date < today_local():
            raise InvalidData("A data do evento não pode estar no passado.")

        event = EventModel(
            name=name,
            event_date=event_date,
            family_account_id=family_account_id,
            created_by=profile_id,
        )
        event.salvar()
        db.session.commit()

        self.notify_service.execute(
            NotificationPreferenceModel.EVENT_CREATED,
            family_account_id,
            "GUP: novo evento",
            f'Um novo evento foi criado: "{event.name}" em {event.event_date.strftime("%d/%m/%Y")}.',
        )

        return event.to_dict()
