import math
from flask import g, session, request, Blueprint, jsonify
from utils.auth import familia_required
from services.resgate.ler_resgate_por_crianca_service import ListarResgatesCriancaService
from services.conta_familia.listar_criancas_service import ListarCriancasFamiliaService
from exceptions import NaoEncontrado, DadosInvalidos

resgate_bp = Blueprint("resgates", __name__, url_prefix="/resgates_feitos")


@resgate_bp.get('/')
@familia_required
def visualizar_resgates():
    conexao = g.conexao
    conta_id = session.get("conta_id")

    service_criancas = ListarCriancasFamiliaService(conexao)
    criancas = service_criancas.por_conta(conta_id)
    if not criancas:
        raise NaoEncontrado("Nenhuma criança cadastrada nesta família.")

    crianca_selecionada_id = request.args.get('crianca_id', type=int)
    pagina = request.args.get('pagina', 1, type=int)
    elementos_por_pagina = 10

    if crianca_selecionada_id:
        ids_permitidos = {c["id"] for c in criancas}
        if crianca_selecionada_id not in ids_permitidos:
            raise NaoEncontrado("Criança não encontrada nesta família.")
        crianca_id = crianca_selecionada_id
    else:
        crianca_id = criancas[0]["id"]

    if pagina < 1:
        raise DadosInvalidos("Página deve ser um número positivo.")

    offset = (pagina - 1) * elementos_por_pagina

    service_resgates = ListarResgatesCriancaService(conexao)
    resultado = service_resgates.listar_resgates(offset, elementos_por_pagina, crianca_id)

    total_paginas = math.ceil(resultado["total_elementos"] / elementos_por_pagina) or 1

    return jsonify({
        "dados": resultado["resgates"],
        "pagina_atual": pagina,
        "total_paginas": total_paginas,
        "criancas": criancas,
    }), 200