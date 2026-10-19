from flask import Blueprint, jsonify, request, session, g
from services.level.profile_level_service import ProfileLevelService
from utils.auth import profile_required

level_bp = Blueprint("niveis", __name__, url_prefix="/niveis")

@level_bp.get('/pendente')
@profile_required
def pending_level_up():
    profile_id = session.get("profile_id")

    service = ProfileLevelService(g.connection)
    return jsonify(service.get_pending_level_up(profile_id)), 200


@level_bp.post('/visto')
@profile_required
def level_up_seen():
    data = request.get_json() or {}
    profile_id = session.get("profile_id")

    service = ProfileLevelService(g.connection)
    return jsonify(service.acknowledge_level_up(profile_id, data.get("level"))), 200
