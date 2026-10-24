
from datetime import datetime
from models.event_model import EventModel
from repositories.event_repository import EventRepository
from exceptions import InvalidData
from utils.dates import parse_date, today_local


class CreateEventService:
    def __init__(self, connection):
            self.connection = connection
            self.event_repo = EventRepository(connection)
    
    def execute(self, family_account_id: int, profile_id: int, data):
   
        if not data.get("name"):
            raise InvalidData(f"O campo nome é obrigatório.")

        if not data.get("eventDate"):
            raise InvalidData(f"O campo da data é obrigatório.")

        event_date = parse_date(data.get("eventDate"), "Data do evento")
        if event_date < today_local():
            raise InvalidData("A data do evento não pode estar no passado.")

        try:
            event_date = datetime.strptime(data.get("eventDate"), '%Y-%m-%d')
        except ValueError:
            raise InvalidData("O formato da data é inválido.")
        except TypeError:
            raise InvalidData("O campo 'data' deve ser uma string no formato YYYY-MM-DD.")
    
        event = EventModel(
            name=data["name"],
            event_date=event_date,
            family_account_id=family_account_id,
            created_by=profile_id,
        )
    
        try:
            new_id = self.event_repo.create(event.to_insertion())
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
    
        return self.event_repo.find_by_id(new_id).to_dict()