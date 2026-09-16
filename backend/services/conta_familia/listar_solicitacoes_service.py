from repositories.solicitacao_repository import SolicitacaoRepository
from repositories.conta_familia_repository import ContaFamiliaRepository
from exceptions import NaoEncontrado, DadosInvalidos

class ListarSolicitacoesService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.solicitacao_repo = SolicitacaoRepository(conexao)
        self.conta_repo = ContaFamiliaRepository(conexao)

    def visualizar_todas(self, conta_id):
        conta = self.conta_repo.buscar_por_id(conta_id)
        if not conta:
            raise NaoEncontrado("Conta família não encontrada.")

        resultados = self.solicitacao_repo.listar_pendentes_por_conta(conta_id)
        return [p.to_dict() for p in resultados]