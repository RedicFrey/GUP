
from flask import Blueprint, jsonify, session, request, g
from utils.auth import profile_required
from services.child.get_child_info_service import GetChildInfoService
from services.child.list_children_service import FamilySChildren
from services.coin_history.list_coin_history_by_child_service import ListCoinHistoryByChildService
from exceptions import NotFound

coin_history_bp = Blueprint('historico', __name__, url_prefix="/historicos")

MAX_PAGE_SIZE = 50

@coin_history_bp.get('/', strict_slashes=False)
@profile_required
def history():
    is_responsible = session.get('profile_type') == 'responsible'
    family_account = session.get('family_account_id')
    profile_id = session.get('profile_id')
    connection = g.connection

    child_id = request.args.get("child_id", type=int)
    filtro_tipo = request.args.get("filter")
    if filtro_tipo not in (None, "credit", "debit"):
        filtro_tipo = None

    size = request.args.get("size", type=int)
    page = max(request.args.get("page", default=1, type=int), 1)
    if size is not None:
        size = min(max(size, 1), MAX_PAGE_SIZE)

    children = []
    if is_responsible:
        children = FamilySChildren(connection).execute(profile_id ,family_account)
        if not children:
            raise NotFound("Nenhuma criança cadastrada nesta família.")

        if child_id is None:
            child = children[0]
        else:
            child = next((c for c in children if c["id"] == child_id), None)
            if child is None:
                raise NotFound("Criança não encontrada nesta família.")
    else:
        child = GetChildInfoService(connection).get(profile_id, family_account)

    history_list = []
    total = 0
    if child:
        history_service = ListCoinHistoryByChildService(connection)
        offset = (page - 1) * size if size else 0
        records = history_service.execute(child["id"], amount_type=filtro_tipo, limit=size, offset=offset)
        history_list = [r.to_dict() for r in records]
        total = history_service.count(child["id"], amount_type=filtro_tipo)

    return jsonify({
        "child": child,
        "children": children,
        "history": history_list,     
        "total": total,              
        "page": page,
        "size": size,
        "is_responsible": is_responsible,
    }), 200
