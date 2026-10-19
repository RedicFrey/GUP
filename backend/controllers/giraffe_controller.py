from flask import Blueprint, jsonify, session, g
from services.giraffe.list_giraffe_profile_service import GiraffeProfileService
from services.giraffe.list_items_giraffe_service import GiraffeItemsListService
from utils.auth import profile_required

giraffe_bp = Blueprint("girafas", __name__, url_prefix="/girafas")

@giraffe_bp.get('/me')
@profile_required
def get_my_giraffe():
    profile_id = session.get("profile_id")

    service = GiraffeProfileService(g.connection)
    giraffe = service.execute(profile_id)

    return jsonify(giraffe), 200


@giraffe_bp.get('/itens/<item_type>')
@profile_required
def list_items(item_type):
    service = GiraffeItemsListService(g.connection)
    items = service.execute(item_type)

    return jsonify(items), 200

from flask import request
from services.giraffe.update_giraffe_service import GiraffeUpdateService

@giraffe_bp.patch('/me')
@profile_required
def update_my_giraffe():
    data = request.get_json() or {}
    profile_id = session.get("profile_id")

    service = GiraffeUpdateService(g.connection)
    giraffe = service.execute(profile_id, data)

    return jsonify(giraffe), 200