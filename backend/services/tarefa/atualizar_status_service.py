from datetime import datetime
from repositories.tarefa_repository import TarefaRepository
from repositories.crianca_repository import CriancaRepository
from services.historico.criar_historico_crianca_service import CriarHistoricoCriancaService
from exceptions import DadosInvalidos, NaoEncontrado

STATUS_VALIDOS = {"pendente", "espera", "concluida"}


class AtualizarStatusTarefaService:
    def __init__(self, conexao):
        self.tarefa_repo = TarefaRepository(conexao)
        self.crianca_repo = CriancaRepository(conexao)
        self.historico_service = CriarHistoricoCriancaService(conexao)
        self.conexao = conexao

    def atualizar_status(self, tarefa_id, novo_status, usuario_id, tipo_usuario, foto_comprovacao=None):
        tarefa = self.tarefa_repo.buscar_por_id(tarefa_id)
        if tarefa is None:
            raise NaoEncontrado("Não foi possível encontrar a tarefa.")

        if tarefa.status == "concluida":
            raise DadosInvalidos("Esta tarefa já foi concluída e as moedas já foram pagas.")

        novo_status = (novo_status or "").lower()
        if novo_status not in STATUS_VALIDOS:
            raise DadosInvalidos("Status inválido.")

        if tipo_usuario == "crianca":
            if tarefa.crianca_id != usuario_id:
                raise DadosInvalidos("Essa tarefa não é sua.")
            if novo_status != "espera":
                raise DadosInvalidos("A criança só pode enviar a tarefa para análise.")
            if not foto_comprovacao:
                raise DadosInvalidos("Envie uma foto como comprovação para concluir a tarefa.")

        elif tipo_usuario == "responsavel":
            if tarefa.responsavel_id != usuario_id:
                raise DadosInvalidos("Essa tarefa não é da sua família.")
            if novo_status not in ("concluida", "pendente"):
                raise DadosInvalidos("O responsável só pode aprovar ou recusar a tarefa.")

        else:
            raise DadosInvalidos("Tipo de usuário inválido.")

        dados_atualizacao = {"status": novo_status}
        if foto_comprovacao is not None:
            dados_atualizacao["foto_comprovacao"] = foto_comprovacao
        if novo_status == "concluida":
            dados_atualizacao["data_conclusao"] = datetime.now()

        try:
            self.tarefa_repo.atualizar(tarefa_id, dados_atualizacao)

            if novo_status == "concluida":
                self._pagar_recompensa(tarefa)

            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        tarefa_atualizada = self.tarefa_repo.buscar_por_id(tarefa_id)
        return tarefa_atualizada.to_dict()

    def _pagar_recompensa(self, tarefa):
        crianca = self.crianca_repo.buscar_por_id(tarefa.crianca_id)
        if not crianca:
            raise NaoEncontrado("Criança não encontrada para receber a recompensa.")

        novo_saldo = crianca.moedas + tarefa.moedas_ganha
        self.crianca_repo.atualizar(tarefa.crianca_id, {"moedas": novo_saldo})

        self.historico_service.criar_historico(
            crianca_id=tarefa.crianca_id,
            tipo_valor="entrada",
            origem="tarefa",
            valor=tarefa.moedas_ganha,
            titulo=f"Tarefa concluída: {tarefa.titulo}",
        )