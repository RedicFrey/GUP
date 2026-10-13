from flask import Blueprint, jsonify, request, session, g
from services.event.create_event_service import EventsCreationService
from services.event.list_family_event_service import EventsFamilyService
from utils.auth import responsible_required, profile_required
from exceptions import InvalidData

event_bp = Blueprint("eventos", __name__, url_prefix="/eventos")

DEFAULT_PER_PAGE = 7
MAX_PER_PAGE = 50   # teto, para ninguém pedir 10000 de uma vez


# GET /eventos/?page=2&per_page=15
@event_bp.get('/', strict_slashes=False)
@profile_required
def list_events():

    connection = g.connection

    family_account_id = session.get("family_account_id")

    # valores inválidos ou ausentes caem no padrão; page nunca fica abaixo de 1
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = min(max(request.args.get("per_page", DEFAULT_PER_PAGE, type=int), 1), MAX_PER_PAGE)

    limit = per_page
    offset = (page - 1) * per_page

    service_events = EventsFamilyService(connection)
    result = service_events.execute(family_account_id, limit, offset)

    return jsonify({
        "events": result["events"],
        "total": result["total"],
        "page": page,
        "per_page": per_page,
    }), 200


@event_bp.post('/criar')
@responsible_required
def create():

    data = request.get_json() or {}

    if not data:
        raise InvalidData("Envie os dados do evento.")

    profile_id = session.get("profile_id")
    family_account_id = session.get("family_account_id")
    connection = g.connection

    service_events = EventsCreationService(connection)
    events = service_events.execute(family_account_id ,profile_id, data)

    return jsonify(events), 201
