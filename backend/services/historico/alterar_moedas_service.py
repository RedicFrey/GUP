from repositories.crianca_repository import CriancaRepository
from services.historico.criar_historico_crianca_service import CriarHistoricoCriancaService
from exceptions import DadosInvalidos, NaoEncontrado


class AjustarMoedasService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)
        self.historico_service = CriarHistoricoCriancaService(conexao)

    def alterar_moedas(self, conta_id, crianca_id, valor, motivo):
        crianca = self.crianca_repo.buscar_por_id(crianca_id)
        if not crianca:
            raise NaoEncontrado("Criança não encontrada.")

        if crianca.usuario.conta_id != conta_id:
            raise DadosInvalidos("Essa criança não pertence à sua família.")

        try:
            valor = int(valor)
        except (TypeError, ValueError):
            raise DadosInvalidos("O valor deve ser um número inteiro.")

        if valor == 0:
            raise DadosInvalidos("Informe um valor diferente de zero.")

        if not motivo or not motivo.strip():
            raise DadosInvalidos("Informe o motivo do ajuste.")

        novo_saldo = crianca.moedas + valor
        if novo_saldo < 0:
            raise DadosInvalidos("Esse ajuste deixaria o saldo da criança negativo.")

        tipo_valor = "entrada" if valor >= 0 else "saida"

        try:
            self.crianca_repo.atualizar(crianca.usuario.id, {"moedas": novo_saldo})
            self.historico_service.criar_historico(
                crianca_id=crianca.usuario.id,
                tipo_valor=tipo_valor,
                origem="ajuste_manual",
                valor=abs(valor), 
                titulo=f"Ajuste manual: {motivo.strip()}",
            )
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.crianca_repo.buscar_por_id(crianca.usuario.id).to_dict()