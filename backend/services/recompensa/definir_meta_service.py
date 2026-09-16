from repositories.crianca_repository import CriancaRepository
from repositories.recompensa_repository import RecompensaRepository
from exceptions import NaoEncontrado

class DefinirMetaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)
        self.recompensa_repo = RecompensaRepository(conexao)

    def definir_meta(self, usuario_id, recompensa_id):
        crianca = self.crianca_repo.buscar_por_id(usuario_id)
        if not crianca:
            raise NaoEncontrado("Criança não encontrada.")

        recompensa = self.recompensa_repo.buscar_por_id(recompensa_id)
        if not recompensa:
            raise NaoEncontrado("Recompensa não encontrada.")

        try:
            self.crianca_repo.atualizar(usuario_id, {"meta_id": recompensa.id})
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.crianca_repo.buscar_por_id(usuario_id).to_dict()