from flask import Blueprint, jsonify, request, session, g
from services.usuario.listar_usuario_familia_service import ListarUsuarioService
from services.usuario.crianca.listar_crianca_service import ListarCriancaService
from exceptions import NaoEncontrado
from services.usuario.atualizar_usuario_service import AtualizarUsuarioService
from utils.auth import login_required

usuario_bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

@usuario_bp.get('/perfil')
@login_required
def perfil():

    conexao = g.conexao

    usuario_id = session.get("usuario_id")

    service_usuario = ListarUsuarioService(conexao)
    usuario = service_usuario.listar_usuario(usuario_id)

    if session.get("tipo_usuario") == "crianca":

        service_crianca = ListarCriancaService(conexao)
        crianca = service_crianca.listar_crianca(usuario_id)

        return jsonify({
            "usuario": usuario.to_dict(),
            "tipo_usuario": session.get("tipo_usuario"),
            "crianca": crianca.to_dict()
        }), 200

    return jsonify({
        "usuario": usuario.to_dict(),
        "tipo_usuario": session.get("tipo_usuario")
    }), 200

@usuario_bp.put('/perfil')
@login_required
def atualizar_perfil():

    conexao = g.conexao
    usuario_id = session.get("usuario_id")  # nunca confiar em id vindo do body

    dados = request.get_json() or {}
    if not dados:
        return jsonify({"erro": "Dados inválidos ou ausentes."}), 400

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")  # pode não vir, ou vir vazio

    if not nome or not email:
        return jsonify({"erro": "Nome e email são obrigatórios."}), 400

    service_usuario = AtualizarUsuarioService(conexao)

    try:
        usuario_atualizado = service_usuario.atualizar_usuario(usuario_id, {
            "nome":nome,
            "email":email,
            "senha":senha  
            })

    # except EmailJaExisteError:
    #     return jsonify({"erro": "Este email já está em uso."}), 409
    except NaoEncontrado:
        raise ValueError("Usuário não encontrado.")

    return jsonify({"usuario": usuario_atualizado.to_dict()}), 200
