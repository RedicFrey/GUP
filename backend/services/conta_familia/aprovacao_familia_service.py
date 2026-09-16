from repositories.solicitacao_repository import SolicitacaoRepository
from repositories.usuario_repository import UsuarioRepository
from exceptions import NaoEncontrado, DadosInvalidos

RESPOSTAS_VALIDAS = {"aprovado", "recusado"}

class ResponderSolicitacaoService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.solicitacao_repo = SolicitacaoRepository(conexao)
        self.usuario_repo = UsuarioRepository(conexao)

    def responder(self, solicitacao_id, conta_id_responsavel, resposta):
        if resposta not in RESPOSTAS_VALIDAS:
            raise DadosInvalidos("Resposta deve ser 'aprovado' ou 'recusado'.")

        solicitacao = self.solicitacao_repo.buscar_por_id(solicitacao_id)
        if not solicitacao:
            raise NaoEncontrado("Solicitação não encontrada.")

        if solicitacao.conta_id != conta_id_responsavel:
            raise NaoEncontrado("Solicitação não encontrada.")

        if solicitacao.status != "pendente":
            raise DadosInvalidos("Essa solicitação já foi respondida.")

        try:
            self.solicitacao_repo.atualizar(solicitacao_id, {"status": resposta})

            if resposta == "aprovado":
                self.usuario_repo.atualizar(solicitacao.usuario_id, {"conta_id": solicitacao.conta_id})

            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.solicitacao_repo.buscar_por_id(solicitacao_id).to_dict()