from repositories.historico_repository import HistoricoRepository


class HistoricoPorCriancaService:

    def __init__(self, conexao):
        self.historico_repo = HistoricoRepository(conexao)

    def listar_historico_por_crianca(self, crianca_id, tipo_valor=None):
        return self.historico_repo.listar_por_crianca(crianca_id, tipo_valor=tipo_valor)