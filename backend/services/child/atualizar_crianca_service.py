from backend.repositories.child_repository import CriancaRepository
from exceptions import DadosInvalidos, NaoEncontrado

class AtualizarCriarService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)

    CAMPOS_PERMITIDOS = {
        "meta_id": int,
        "xp": int
    }

    def atualizar_crianca(self, dados, id_user):

        crianca = self.crianca_repo.buscar_por_id(id_user)
        if crianca is None:
            raise NaoEncontrado("Criança não encontrada.")

        dados_atualizar = {}
        for campo, atualizar in self.CAMPOS_PERMITIDOS.items():
            if campo not in dados or dados[campo] is None:
                continue
            valor = dados[campo]
            dados_atualizar[campo] = atualizar(valor) if atualizar else valor    
        
        try:
            self.crianca_repo.atualizar(id_user, dados_atualizar)
            self.conexao.commit()

        except Exception as e:
            self.conexao.rollback()
            raise DadosInvalidos("Não foi possível aplicar as alterações") from e

        return self.crianca_repo.buscar_por_id(id_user).to_dict()
        