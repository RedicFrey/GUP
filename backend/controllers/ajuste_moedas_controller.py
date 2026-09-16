from flask import Blueprint, jsonify, request, session, g
from services.historico.alterar_moedas_service import AjustarMoedasService
from utils.auth import familia_required
from exceptions import DadosInvalidos

ajuste_moedas_bp = Blueprint('ajuste_moedas', __name__, url_prefix='/criancas')


@ajuste_moedas_bp.post('/<int:crianca_id>/ajustar-moedas')
@familia_required
def ajustar_moedas(crianca_id):
    if session.get('tipo_usuario') != 'responsavel':
        raise DadosInvalidos("Apenas responsáveis podem ajustar moedas.")

    dados = request.get_json() or {}
    tipo_ajuste = dados.get('tipo_ajuste')
    valor = dados.get('valor')
    motivo = dados.get('motivo')

    if tipo_ajuste not in ('adicionar', 'remover'):
        raise DadosInvalidos("Informe se o ajuste é para adicionar ou remover moedas.")

    try:
        valor_int = abs(int(valor))
    except (TypeError, ValueError):
        raise DadosInvalidos("Informe uma quantidade de moedas válida.")

    if tipo_ajuste == 'remover':
        valor_int = -valor_int

    conexao = g.conexao

    service_ajuste = AjustarMoedasService(conexao)
    crianca = service_ajuste.alterar_moedas(
        conta_id=session.get('conta_id'),
        crianca_id=crianca_id,
        valor=valor_int,
        motivo=motivo,
    )
    return jsonify(crianca), 200