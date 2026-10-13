import math
from flask import g, session, request, Blueprint, jsonify
from utils.auth import profile_required, responsible_required
from services.redemption.list_redemption_by_child import ChildRedemptionsService
from services.redemption.update_redemption_service import RedemptionUpdateService
from services.child.list_children_service import FamilySChildren
from exceptions import NotFound, InvalidData

redemption_bp = Blueprint("resgates", __name__, url_prefix="/resgates_feitos")


@redemption_bp.get('/')
@profile_required
def view_redemptions():
    connection = g.connection
    family_account_id = session.get("family_account_id")
    profile_type = session.get("profile_type")
    profile_id = session.get("profile_id")

    service_criancas = FamilySChildren(connection)
    children = service_criancas.execute(family_account_id)
    if not children:
        raise NotFound("Nenhuma criança cadastrada nesta família.")

    crianca_selecionada_id = request.args.get('crianca_id', type=int)
    pagina = request.args.get('pagina', 1, type=int)
    # por_pagina é opcional (o front manda o mesmo valor do paginate); padrão 10, máximo 50
    elementos_por_pagina = min(max(request.args.get('por_pagina', 10, type=int), 1), 50)

    if crianca_selecionada_id:
        ids_permitidos = {c["id"] for c in children}
        if crianca_selecionada_id not in ids_permitidos:
            raise NotFound("Criança não encontrada nesta família.")
        crianca_id = crianca_selecionada_id
    else:
        crianca_id = children[0]["id"]

    if pagina < 1:
        raise InvalidData("Página deve ser um número positivo.")

    offset = (pagina - 1) * elementos_por_pagina

    service_resgates = ChildRedemptionsService(connection)
    resultado = service_resgates.execute(offset, elementos_por_pagina, crianca_id, profile_id, profile_type)

    total_paginas = math.ceil(resultado["elements"] / elementos_por_pagina) or 1

    is_responsible = session.get("profile_type") == "responsible"

    return jsonify({
        "dados": resultado["redemptions"],
        "total": resultado["elements"],      # COUNT(*): o paginate calcula as páginas com ele
        "pagina_atual": pagina,
        "total_paginas": total_paginas,
        "children": children if is_responsible else [],
        "is_responsible": is_responsible,
    }), 200

@redemption_bp.put('/confirmar')
@responsible_required
def update_redemption():

    connection = g.connection
    data = request.get_json() or {}

    redemption_service = RedemptionUpdateService(connection)
    redemption_service.execute(
        redemption_id=data.get("id"),
        status=data.get("status"),
    )

    return jsonify({"message": "Recompensa marcada como entrega"}), 200