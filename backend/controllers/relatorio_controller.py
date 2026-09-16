from flask import Blueprint, jsonify, session, request, g
from services.usuario.crianca.relatorio_desempenho_service import RelatorioDesempenhoService
from utils.auth import familia_required
from services.conta_familia.listar_criancas_service import ListarCriancasFamiliaService
from exceptions import NaoEncontrado, DadosInvalidos

relatorio_bp = Blueprint('relatorio', __name__, url_prefix='/relatorios')


@relatorio_bp.get('/')
@familia_required
def relatorio():
    if session.get('tipo_usuario') != 'responsavel':
        raise DadosInvalidos("Apenas responsáveis podem ver relatórios.")

    conta_id = session.get('conta_id')
    conexao = g.conexao

    criancas_service = ListarCriancasFamiliaService(conexao)
    criancas = criancas_service.por_conta(conta_id)

    if not criancas:
        raise NaoEncontrado("Nenhuma criança cadastrada nesta família.")

    crianca_selecionada_id = request.args.get('crianca_id')

    if crianca_selecionada_id:
        try:
            crianca_id = int(crianca_selecionada_id)
        except (TypeError, ValueError):
            raise DadosInvalidos("crianca_id deve ser um número inteiro.")

        ids_permitidos = {c["id"] for c in criancas}
        if crianca_id not in ids_permitidos:
            raise NaoEncontrado("Criança não encontrada nesta família.")
    else:
        crianca_id = criancas[0]["id"]

    relatorio_service = RelatorioDesempenhoService(conexao)
    dados_relatorio = relatorio_service.gerar(crianca_id, conta_id)

    dados_relatorio = {
        **dados_relatorio,
        "crianca": dados_relatorio["crianca"],
        "tarefas_concluidas": [t.to_dict() for t in dados_relatorio["tarefas_concluidas"]],
    }

    return jsonify({
        "relatorio": dados_relatorio,
        "criancas": criancas,
    }), 200