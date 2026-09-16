from flask import Blueprint, jsonify, request, session, g
from services.evento.criar_evento_service import CriarEventoService
from services.evento.listar_usuarios_evento_service import ListarEventoUsuarioService
from utils.auth import familia_required
from exceptions import DadosInvalidos

evento_bp = Blueprint("eventos", __name__, url_prefix="/eventos")


@evento_bp.get('/')
@familia_required
def listar_eventos():

    conexao = g.conexao

    usuario_id = session.get("usuario_id")

    service_eventos = ListarEventoUsuarioService(conexao)
    eventos = service_eventos.listar_eventos_usuario(usuario_id)

    return jsonify(eventos), 200


@evento_bp.post('/')
@familia_required
def criar_evento():

    dados = request.get_json() or {}

    if not dados:
        raise DadosInvalidos("Envie os dados do evento.")

    usuario_logado = session.get("usuario_id")

    dados["usuario_id"] = usuario_logado

    conexao = g.conexao

    service_eventos = CriarEventoService(conexao)
    eventos = service_eventos.registrar_evento(dados)

    return jsonify(eventos), 201
