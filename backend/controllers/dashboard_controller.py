from flask import Blueprint, jsonify, session, g
from services.montar_dashboard_service import MontarDashboardService
from repositories.solicitacao_repository import SolicitacaoRepository
from repositories.usuario_repository import UsuarioRepository
from utils.auth import login_required

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.get('/dashboard')
@login_required
def index():
    conexao = g.conexao
    usuario_id = session.get("usuario_id")


    usuario_repo = UsuarioRepository(conexao)
    usuario_atual = usuario_repo.buscar_por_id(usuario_id)

    tem_familia = bool(usuario_atual.conta_id)

    session["tem_familia"] = tem_familia
    if tem_familia:
        session["conta_id"] = usuario_atual.conta_id

    if not tem_familia:
        solicitacao_repo = SolicitacaoRepository(conexao)
        ultima_solicitacao = solicitacao_repo.buscar_ultima_por_usuario(usuario_id)

        if ultima_solicitacao and ultima_solicitacao.status == "pendente":
            return jsonify({
                "tem_familia": False,
                "status_solicitacao": "pendente",
                "mensagem": "Seu pedido para entrar na família está aguardando aprovação.",
            }), 200

        if ultima_solicitacao and ultima_solicitacao.status == "recusado":
            return jsonify({
                "tem_familia": False,
                "status_solicitacao": "recusado",
                "mensagem": "Seu último pedido para entrar na família foi recusado. Você pode tentar novamente.",
            }), 200

        return jsonify({
            "tem_familia": False,
            "status_solicitacao": None,
            "mensagem": "Você ainda não faz parte de uma família.",
        }), 200

    try:
        service = MontarDashboardService(conexao)
        resultado = service.montar(
            usuario_id=usuario_id,
            tipo_usuario=session.get("tipo_usuario"),
            email=session.get("email"),
            nome=session.get("nome_usuario"),
        )
        return jsonify(resultado), 200
    except Exception as e:
        raise ValueError("Erro ao carregar dados do dashboard") from e