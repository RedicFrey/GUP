from flask import Blueprint, jsonify, request, session, g
from utils.auth import login_required
from services.conta_familia.criar_conta_familia_service import CriarContaFamiliaService
from services.conta_familia.entrar_conta_familia import LoginService

auth_conta_bp = Blueprint("auth_conta_familia", __name__, url_prefix="/auth-contas")

@auth_conta_bp.post('/criar')
@login_required
def criar_conta():
    conexao = g.conexao


    dados = request.get_json() or {}
    id_user = session.get("usuario_id")

    service_criar_conta = CriarContaFamiliaService(conexao)     
    conta, usuario = service_criar_conta.registrar_conta(dados, id_user)

    session["conta_id"] = usuario["conta_id"]
    if session.get("tem_familia") == False:
        session["tem_familia"] = True

    return jsonify(conta), 201


@auth_conta_bp.post('/login')
@login_required
def login():
    conexao = g.conexao

    try:
        usuario_id = session.get("usuario_id")

        dados = request.get_json() or {}

        service_logar = LoginService(conexao)
        resultado = service_logar.autenticar(dados, usuario_id)

        return jsonify(resultado), 200

    except ValueError as e:
        return jsonify({"erro": str(e)}), 400