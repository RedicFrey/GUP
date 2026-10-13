from flask import Blueprint, jsonify, session, request, g
from utils.auth import profile_required
from services.child.child_info_service import ChildInfoService
from services.child.list_children_service import FamilySChildren
from services.coin_history.list_history_by_child_service import CoinHistoryByChild
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

    # paginação: sem "size" devolve tudo (comportamento antigo)
    size = request.args.get("size", type=int)
    page = max(request.args.get("page", default=1, type=int), 1)
    if size is not None:
        size = min(max(size, 1), MAX_PAGE_SIZE)

    children = []
    if is_responsible:
        children = FamilySChildren(connection).execute(family_account)
        if not children:
            raise NotFound("Nenhuma criança cadastrada nesta família.")

        if child_id is None:
            child = children[0]
        else:
            child = next((c for c in children if c["id"] == child_id), None)
            if child is None:
                raise NotFound("Criança não encontrada nesta família.")
    else:
        child = ChildInfoService(connection).get(profile_id) or None

    history_list = []
    total = 0
    if child:
        history_service = CoinHistoryByChild(connection)
        offset = (page - 1) * size if size else 0
        records = history_service.execute(child["id"], amount_type=filtro_tipo, limit=size, offset=offset)
        history_list = [r.to_dict() for r in records]
        total = history_service.count(child["id"], amount_type=filtro_tipo)

    return jsonify({
        "child": child,
        "children": children,
        "history": history_list,      # só a página pedida (ou tudo, se não veio size)
        "total": total,               # COUNT(*) com o mesmo filtro: o front calcula as páginas
        "page": page,
        "size": size,
        "is_responsible": is_responsible,
    }), 200


# from flask import Blueprint, jsonify, session, request, g
# from utils.auth import profile_required
# from services.child.child_info_service import ChildInfoService
# from services.child.list_children_service import FamilySChildren
# from services.coin_history.list_history_by_child_service import CoinHistoryByChild
# from exceptions import NotFound

# coin_history_bp = Blueprint('historico', __name__, url_prefix="/historicos")


# @coin_history_bp.get('/<int:child_id>')
# @profile_required
# def history(child_id):
#     is_responsible = session.get('profile_type') == 'responsible'
#     family_account = session.get('family_account_id')
#     profile_id = session.get('profile_id')

#     connection = g.connection

#     if is_responsible:
#         children_service = FamilySChildren(connection)
#         children = children_service.execute(family_account)
#         if not children:
#             raise NotFound("Nenhuma criança cadastrada nesta família.")

#         if child_id:
#             ids_permitidos = {str(c["id"]) for c in children}
#             if child_id not in ids_permitidos:
#                 raise NotFound("Criança não encontrada nesta família.")

#             child = next(c for c in children if str(c["id"]) == child_id)
#         else:
#             child = children[0]
#     else:
#         child = []
#         children_service = ChildInfoService(connection)
#         child_obj = children_service.get(profile_id)
#         child = child_obj if child_obj else None

#     filtro_tipo = request.args.get("filtro")

#     history_list = []
#     if child:
#         coin_history_service = CoinHistoryByChild(connection)
#         records = coin_history_service.execute(child["id"], amount_type=filtro_tipo)
#         history_list = [r.to_dict() for r in records]

#     return jsonify({
#         "child": child,
#         "children": children,
#         "history": history_list,
#         "is_responsible": is_responsible,
#     }), 200