from flask import Blueprint, jsonify, request, session, g
from services.usuario.criar_usuario_service import CriarUsuarioService
from services.usuario.login_service import LoginService
from exceptions import NaoEncontrado
from utils.auth import login_required

auth_usuario_bp = Blueprint('auth_usuarios', __name__, url_prefix='/auth-usuarios')

@auth_usuario_bp.post('/cadastro')
def cadastro():
    conexao = g.conexao

    dados = request.get_json() or {}

    service = CriarUsuarioService(conexao)
    usuario = service.registrar_usuario(dados)

    session['usuario_id'] = usuario["id"]
    session['email'] = usuario["email"]
    session['nome_usuario'] = usuario["nome"]
    session['tipo_usuario'] = usuario["tipo_usuario"]
    session['tem_familia'] = usuario.get("conta_id") is not None
    session['conta_id'] = usuario.get("conta_id")

    return jsonify(usuario), 201


@auth_usuario_bp.post('/login')
def login():
    conexao = g.conexao

    dados = request.get_json() or {}

    service = LoginService(conexao)
    usuario = service.autenticar(dados)

    session['usuario_id'] = usuario["id"]
    session['email'] = usuario["email"]
    session['nome_usuario'] = usuario["nome"]
    session['tipo_usuario'] = usuario["tipo_usuario"]
    session['tem_familia'] = usuario.get("conta_id") is not None
    session['conta_id'] = usuario.get("conta_id")

    return jsonify(usuario), 200


@auth_usuario_bp.post('/logout')
def logout():
    session.clear()
    return jsonify({"mensagem": "Sessão encerrada com sucesso."}), 200


@auth_usuario_bp.get('/me')
@login_required
def me():

    return jsonify({
        "logado": True,
        "usuario_id": session.get("usuario_id"),
        "nome_usuario": session.get("nome_usuario"),
        "tipo_usuario": session.get("tipo_usuario"),
        "tem_familia": bool(session.get("tem_familia")),
        "conta_id": session.get("conta_id"),
    }), 200