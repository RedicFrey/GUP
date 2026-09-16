from repositories.resgate_repository import ResgateRepository
from repositories.crianca_repository import CriancaRepository
from exceptions import NaoEncontrado

class ListarResgatesCriancaService:
    def __init__(self, conexao):
        self.resgate_repo = ResgateRepository(conexao)
        self.crianca_repo = CriancaRepository(conexao)

    def listar_resgates(self, offset, elementos_por_pagina, crianca_id):
        crianca = self.crianca_repo.buscar_por_id(crianca_id)
        if crianca is None:
            raise NaoEncontrado("Não foi possível encontrar a criança.")
 
        resgates = self.resgate_repo.listar_por_crianca(offset, elementos_por_pagina, crianca_id)
        total_elementos = self.resgate_repo.listar_todos_resgates_crianca(crianca_id)
 
        return {
            "resgates": [r.to_dict() for r in resgates],
            "total_elementos": total_elementos,
        }