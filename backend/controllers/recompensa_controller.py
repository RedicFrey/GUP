from flask import Blueprint, request, jsonify, session, g
from services.recompensa.criar_recompensa_service import CriarRecompensaService
from services.recompensa.comprar_recompensa_service import ComprarRecompensaService
from services.recompensa.definir_meta_service import DefinirMetaService
from utils.auth import familia_required
from services.recompensa.listar_recompensa_familia_service import ListarRecompensaFamiliaService
from services.usuario.listar_usuario_familia_service import ListarUsuarioService
from services.usuario.crianca.listar_crianca_service import ListarCriancaService

recompensa_bp = Blueprint("recompensas", __name__, url_prefix="/recompensas")

@recompensa_bp.get('/')
@familia_required
def listar():

    conexao = g.conexao

    try:

        conta_id = session.get("conta_id")
        usuario_id = session.get("usuario_id")

        usuario_service = ListarUsuarioService(conexao)
        usuario = usuario_service.listar_usuario(usuario_id)


        crianca_logada = None
        if usuario.tipo_usuario == 'crianca':
            crianca_service = ListarCriancaService(conexao)
            crianca = crianca_service.listar_crianca(usuario.id)
            crianca_logada = crianca.to_dict() if crianca else None

        recompensa_service = ListarRecompensaFamiliaService(conexao)
        recompensas = recompensa_service.listar(conta_id)

        return jsonify({
            "recompensas": recompensas,
            "crianca_logada": crianca_logada,
            "tipo_usuario": session.get('tipo_usuario'),
        }), 200

    except ValueError as e:
        mensagem = str(e)
        if "não existe" in mensagem or "não encontrada" in mensagem:
            return jsonify({"erro": mensagem}), 404
        return jsonify({"erro": mensagem}), 400

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"erro":"Erro ao carregar dados de recompensa"}), 500


@recompensa_bp.post('/')
@familia_required
def criar():

    conta_id = session.get("conta_id")

    if session.get('tipo_usuario') != 'responsavel':
        return jsonify({"erro": "Apenas responsáveis podem criar recompensas."}), 403

    dados = request.get_json() or {}

    conexao = g.conexao

    dados["conta_id"] = conta_id
    
    try:
        service_recompensa = CriarRecompensaService(conexao)
        recompensa = service_recompensa.registrar_recompensa(dados)
        return jsonify(recompensa), 201
    except ValueError as e:
        return jsonify({"erro": str(e)}), 400


@recompensa_bp.post('/comprar/<int:id>')
@familia_required
def comprar(id):
    if session.get('tipo_usuario') != 'crianca':
        return jsonify({"erro": "Apenas crianças podem comprar recompensas."}), 403

    conexao = g.conexao

    try:
        service_crianca = ComprarRecompensaService(conexao)
        crianca = service_crianca.comprar_recompensa(session.get('usuario_id'), id)
        return jsonify(crianca), 200
    except ValueError as e:
        mensagem = str(e)
        if "não foi possivel comprar recompensa" in mensagem or "não encontrada" in mensagem:
            return jsonify({"erro": mensagem}), 404
        return jsonify({"erro": mensagem}), 400
        
    except ValueError as e:
        import traceback
        traceback.print_exc()
        return jsonify({"erro":"Erro com servidor ao comprar recompensa"}), 500


@recompensa_bp.post('/meta/<int:id>')
@familia_required
def meta(id):
    if session.get('tipo_usuario') != 'crianca':
        return jsonify({"erro": "Apenas crianças podem definir metas."}), 403

    conexao = g.conexao

    try:
        service_crianca = DefinirMetaService(conexao)
        crianca = service_crianca.definir_meta(session.get('usuario_id'), id)

        return jsonify(crianca), 200

    except ValueError as e:
        mensagem = str(e)
        if "não foi possivel definir recompensa como meta" in mensagem or "não encontrada" in mensagem:
            return jsonify({"erro": mensagem}), 404
        return jsonify({"erro": mensagem}), 400
    
    except ValueError as e:
        import traceback
        traceback.print_exc()
        return jsonify({"erro":"Erro com servidor ao definir meta"}), 500
