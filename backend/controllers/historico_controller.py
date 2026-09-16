from flask import Blueprint, jsonify, session, request, g
from utils.auth import familia_required
from services.conta_familia.listar_criancas_service import ListarCriancasFamiliaService
from services.usuario.crianca.listar_crianca_service import ListarCriancaService
from services.historico.listar_por_crianca_service import HistoricoPorCriancaService
from exceptions import NaoEncontrado

historico_bp = Blueprint('historico', __name__, url_prefix="/historicos")


@historico_bp.get('/')
@familia_required
def historico():
    eh_responsavel = session.get('tipo_usuario') == 'responsavel'
    conta_id = session.get('conta_id')
    usuario_id = session.get('usuario_id')

    crianca_selecionada_id = request.args.get("crianca_id")

    conexao = g.conexao

    if eh_responsavel:
        criancas_service = ListarCriancasFamiliaService(conexao)
        criancas = criancas_service.por_conta(conta_id)
        if not criancas:
            raise NaoEncontrado("Nenhuma criança cadastrada nesta família.")

        if crianca_selecionada_id:
            ids_permitidos = {str(c["id"]) for c in criancas}
            if crianca_selecionada_id not in ids_permitidos:
                raise NaoEncontrado("Criança não encontrada nesta família.")

            crianca = next(c for c in criancas if str(c["id"]) == crianca_selecionada_id)
        else:
            crianca = criancas[0]
    else:
        criancas = []
        crianca_service = ListarCriancaService(conexao)
        crianca_obj = crianca_service.listar_crianca(usuario_id)
        crianca = crianca_obj.to_dict() if crianca_obj else None

    filtro_tipo = request.args.get("filtro")

    lista_historico = []
    if crianca:
        historico_service = HistoricoPorCriancaService(conexao)
        registros = historico_service.listar_historico_por_crianca(crianca["id"], tipo_valor=filtro_tipo)
        lista_historico = [r.to_dict() for r in registros]

    return jsonify({
        "crianca": crianca,
        "criancas": criancas,
        "historico": lista_historico,
        "eh_responsavel": eh_responsavel,
    }), 200