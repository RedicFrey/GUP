
from flask import Blueprint, jsonify, request, session, g
from services.level.profile_level_service import ProfileLevelService
from repositories.level_repository import LevelRepository
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

# Adiciona esta nova rota para a barra de progresso:
@level_bp.get('/progresso')
@profile_required
def get_level_progress():
    profile_id = session.get("profile_id")
    repo = LevelRepository(g.connection)
    progress = repo.find_progress(profile_id)
    
    if not progress:
        return jsonify({"error": "Progresso não encontrado"}), 404

    return jsonify(progress), 200