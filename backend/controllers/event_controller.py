from controllers.base_controller import BaseController
from utils.auth import profile_required, responsible_required
from services.event.create_event_service import CreateEventService
from services.event.list_family_events_service import ListFamilyEventsService


class EventController(BaseController):
    """Recurso: eventos da agenda da família."""

    NAME = "events"
    URL_PREFIX = "/eventos"

    def register_routes(self):
        self.route("/", self.listar, ["GET"], profile_required, strict_slashes=False)
        self.route("/criar", self.criar, ["POST"], responsible_required)

    def listar(self):
        result = ListFamilyEventsService(self.connection).execute(
            self.family_account_id,
            page=self.parametro("page", int),
            per_page=self.parametro("per_page", int),
        )
        return self.responder(result)

    def criar(self):
        event = CreateEventService(self.connection).execute(
            self.family_account_id, self.profile_id, self.dados_json()
        )
        return self.responder(event, 201)
