
from flask import Blueprint, jsonify, request, session, g
from utils.auth import profile_required, admin_required
from services.family_account.delete_family_account_service import DeleteFamilyAccountService
from services.family_account.get_family_account_service import GetFamilyAccountService

family_account_bp = Blueprint("conta_familia", __name__, url_prefix="/conta")


@family_account_bp.get('/info')
@profile_required
def account_info():
    connection = g.connection
    family_account_id = session.get("family_account_id")
    profile_id = session.get("profile_id")

    service_family = GetFamilyAccountService(connection)
    result = service_family.execute(
        family_account_id=family_account_id,
        # profile_id=profile_id
    );

    return jsonify(result), 200

@family_account_bp.delete('/deletar')
@admin_required
def delete_family_account():
    connection = g.connection
    family_account_id = session.get("family_account_id")
    is_admin = session.get("is_admin", False)

    data = request.get_json() or {}

    service = DeleteFamilyAccountService(connection)
    service.execute(
          is_admin=is_admin, 
          family_account_id=family_account_id, 
          password=data.get("password")
    )

    session.clear()
    return jsonify({"mensagem": "Conta família excluída com sucesso."}), 200