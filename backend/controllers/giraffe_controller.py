
from flask import Blueprint, jsonify, session, g, request
from services.giraffe.get_child_giraffe_service import GetChildGiraffeService
from services.giraffe.list_giraffe_items_service import ListGiraffeItemsService
from services.giraffe.update_giraffe_service import UpdateGiraffeService
from utils.auth import profile_required

giraffe_bp = Blueprint("girafas", __name__, url_prefix="/girafas")

@giraffe_bp.get('/me')
@profile_required
def get_my_giraffe():
    profile_id = session.get("profile_id")

    service = GetChildGiraffeService(g.connection)
    giraffe = service.execute(profile_id)

    return jsonify(giraffe), 200


@giraffe_bp.get('/itens/<item_type>')
@profile_required
def list_items(item_type):
    service = ListGiraffeItemsService(g.connection)
    items = service.execute(item_type)

    return jsonify(items), 200

@giraffe_bp.patch('/me')
@profile_required
def update_my_giraffe():
    data = request.get_json() or {}
    profile_id = session.get("profile_id")

    service = UpdateGiraffeService(g.connection)
    giraffe = service.execute(profile_id, data)

    return jsonify(giraffe), 200