from flask import Blueprint, session, request, g, jsonify
from utils.auth import familia_required
from services.conta_familia.aprovacao_familia_service import ResponderSolicitacaoService
from services.conta_familia.listar_solicitacoes_service import ListarSolicitacoesService

pedidos_familia_bp = Blueprint("pedidos", __name__, url_prefix="/pedidos")

@pedidos_familia_bp.get("/")
@familia_required
def pedidos():

    conexao = g.conexao

    conta_id = session.get("conta_id")

    service_pedidos = ListarSolicitacoesService(conexao)
    pedidos = service_pedidos.visualizar_todas(conta_id)

    return jsonify({"pedidos": pedidos}), 200

@pedidos_familia_bp.post("/<int:id>")
@familia_required
def responder_pedido(id):

    conexao = g.conexao

    dados = request.get_json() or {}
    texto_resposta = dados.get("resposta")

    conta_id = session.get("conta_id")

    service_resposta = ResponderSolicitacaoService(conexao)
    resposta = service_resposta.responder(id, conta_id, texto_resposta)

    return resposta


