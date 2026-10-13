from flask import Blueprint, jsonify, session, g
from services.montar_dashboard_service import MontarDashboardService
from utils.auth import profile_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.get('/dashboard')
@profile_required
def index():
    connection = g.connection
    profile_id = session.get("profile_id")
    profile_type = session.get("profile_type")
    family_account_id = session.get("family_account_id")

    print(profile_id)
    
    try:
        service = MontarDashboardService(connection)
        result = service.execute(
            profile_id=profile_id,
            profile_type=profile_type,
            family_account_id=family_account_id
            # tipo_usuario=session.get("tipo_usuario"),
            # email=session.get("email"),
            # nome=session.get("nome_usuario"),
        )
        return jsonify(result), 200
    except Exception as e:
        raise ValueError("Erro ao carregar dados do dashboard") from e