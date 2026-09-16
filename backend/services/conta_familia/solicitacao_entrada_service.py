from repositories.solicitacao_repository import SolicitacaoRepository
from repositories.conta_familia_repository import ContaFamiliaRepository
from models.solicitacao_model import Solicitacao
from exceptions import NaoEncontrado, DadosInvalidos

class SolicitarEntradaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.solicitacao_repo = SolicitacaoRepository(conexao)
        self.conta_repo = ContaFamiliaRepository(conexao)

    def solicitar(self, usuario_id, conta_id):
        conta = self.conta_repo.buscar_por_id(conta_id)
        if not conta:
            raise NaoEncontrado("Conta família não encontrada.")

        ja_pendente = self.solicitacao_repo.buscar_pendente_por_usuario_e_conta(usuario_id, conta_id)
        if ja_pendente:
            raise DadosInvalidos("Você já tem uma solicitação pendente para esta família.")

        solicitacao = Solicitacao(usuario_id=usuario_id, conta_id=conta_id)

        try:
            solicitacao_id = self.solicitacao_repo.criar(solicitacao.para_insercao())
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return solicitacao_id