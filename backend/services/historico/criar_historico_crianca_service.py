from models.historico_moeda_model import HistoricoMoeda
from repositories.historico_repository import HistoricoRepository
from exceptions import DadosInvalidos

class CriarHistoricoCriancaService:

    def __init__(self, conexao):
        self.conexao = conexao
        self.historico_repo = HistoricoRepository(conexao)

    def criar_historico(self, crianca_id, tipo_valor, origem, valor, titulo):
        if tipo_valor not in ("entrada", "saida"):
            raise DadosInvalidos("tipo_valor deve ser 'entrada' ou 'saida'.")
        if valor < 0:
            raise DadosInvalidos("valor deve ser sempre positivo; o sinal é dado por tipo_valor.")
 
        historico = HistoricoMoeda(
            crianca_id=crianca_id,
            tipo_valor=tipo_valor,
            origem=origem,
            valor=valor,
            titulo=titulo,
        )
        self.historico_repo.criar(historico.para_insercao())