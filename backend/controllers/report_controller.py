
from flask import Blueprint, jsonify, session, request, g
from services.child.get_child_report_service import GetChildMonthlyReportService
from utils.auth import profile_required

report_bp = Blueprint('relatorio', __name__, url_prefix='/relatorios')

@report_bp.get('', strict_slashes=False)
@profile_required
def monthly_report():
    report = GetChildMonthlyReportService(g.connection).execute(
        family_account_id=session["family_account_id"],
        profile_id=session["profile_id"],
        profile_type=session["profile_type"],
        child_profile_id=request.args.get("child_profile_id", type=int),
        month=request.args.get("month"),  
    )
    return jsonify(report), 200
