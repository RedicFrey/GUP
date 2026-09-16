from flask import Blueprint, jsonify, request, session, g
from utils.auth import familia_required
from services.conta_familia.listar_membros_service import ListarMembrosFamiliaService
from repositories.conta_familia_repository import ContaFamiliaRepository

conta_bp = Blueprint("conta_familia", __name__, url_prefix="/contas")

@conta_bp.get('/info')
@familia_required
def informacoes_conta():

    conexao = g.conexao

    conta_id = session.get("conta_id")

    conta_familia_repo = ContaFamiliaRepository(conexao)

    lider_conta_familia = conta_familia_repo.buscar_lider_conta(conta_id)
    lider_convertido = lider_conta_familia.to_dict() if lider_conta_familia else None
       
    service_membros = ListarMembrosFamiliaService(conexao)
    membros = service_membros.listar_membros(conta_id)
    membros_convertidos = [membro.to_dict() for membro in membros] if membros else []

    conta_repo = conta_familia_repo.buscar_por_id(conta_id)
       
    if not conta_repo:
        return jsonify({"erro": "Conta não encontrada no banco de dados."}), 404

    return jsonify({
        "nome_familia": conta_repo.nome,
        "dono_conta": lider_convertido,
        "membros": membros_convertidos,
    }), 200
