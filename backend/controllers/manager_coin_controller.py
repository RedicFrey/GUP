from flask import Blueprint, jsonify, request, session, g
from services.coin_history.manager_coin_history_service import CoinManagerService
from utils.auth import responsible_required
from exceptions import InvalidData

manager_coin_bp = Blueprint('ajuste_moedas', __name__, url_prefix='/ajustar-moedas')

@manager_coin_bp.post('/<int:child_id>')
@responsible_required
def manager(child_id):

    data = request.get_json() or {}
    type = data.get('type')
    amount = data.get('amount')
    reason = data.get('reason')

    if type not in ('add', 'remove'):
        raise InvalidData("Informe se o ajuste é para adicionar ou remover moedas.")

    try:
        amount_int = abs(int(amount))
    except (TypeError, ValueError):
        raise InvalidData("Informe uma quantidade de moedas válida.")

    if type == 'remove':
        amount_int = -amount_int

    connection = g.connection

    service_ajuste = CoinManagerService(connection)
    child = service_ajuste.execute(
        family_account_id=session.get('family_account_id'),
        child_profile_id=child_id,
        amount=amount_int,
        reason=reason,
    )
    return jsonify(child), 200