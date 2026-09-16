from flask import Blueprint, jsonify, request, session, g
from services.tarefa.criar_tarefa_service import CriarTarefaService
from services.tarefa.atualizar_status_service import AtualizarStatusTarefaService
from services.conta_familia.listar_criancas_service import ListarCriancasFamiliaService
from utils.comprovacao import extensao_valida, salvar_comprovacao, remover_comprovacao
from utils.auth import familia_required
from exceptions import DadosInvalidos

tarefa_bp = Blueprint('tarefas', __name__, url_prefix='/tarefas')

@tarefa_bp.get('/criar-info')
@familia_required
def criar_tarefa_info():

    if session.get('tipo_usuario') != 'responsavel':
        return jsonify({"erro": "Apenas responsáveis podem criar tarefas."}), 403

    conexao = g.conexao

    conta_id = session.get("conta_id")
    criancas_service = ListarCriancasFamiliaService(conexao)
    criancas = criancas_service.por_conta(conta_id)
    return jsonify({"criancas": criancas}), 200


@tarefa_bp.post('/criar')
@familia_required
def criar_tarefa():
    if session.get('tipo_usuario') != 'responsavel':
        return jsonify({"erro": "Apenas responsáveis podem criar tarefas."}), 403

    dados = request.get_json() or {}
    if not dados:
        raise DadosInvalidos("Envie os dados da tareda")

    conexao = g.conexao
    dados["responsavel_id"] = session["usuario_id"]
    dados["conta_id"] = session.get("conta_id")

    tarefa_service = CriarTarefaService(conexao)
    tarefa = tarefa_service.criar_tarefa(dados)

    return jsonify(tarefa), 201


@tarefa_bp.post('/<int:id>/status')
@familia_required
def atualizar_status(id):
    novo_status = request.form.get("novo_status")
    arquivo = request.files.get("foto_comprovacao")

    if arquivo and arquivo.filename and not extensao_valida(arquivo.filename):
        raise DadosInvalidos("O arquivo precisa ser uma imagem (png, jpg, jpeg, gif ou webp).")

    conexao = g.conexao
    caminho_foto = None
    if arquivo and arquivo.filename:
        caminho_foto = salvar_comprovacao(arquivo)

    try:
        status_service = AtualizarStatusTarefaService(conexao)
        tarefa = status_service.atualizar_status(
            id, novo_status, session["usuario_id"], session.get("tipo_usuario"),
            foto_comprovacao=caminho_foto,
        )
        return jsonify(tarefa), 200
    except Exception:
        if caminho_foto:
            remover_comprovacao(caminho_foto)
        raise
