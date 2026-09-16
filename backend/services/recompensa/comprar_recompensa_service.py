from models.resgate_model import Resgate
from repositories.crianca_repository import CriancaRepository
from repositories.recompensa_repository import RecompensaRepository
from repositories.resgate_repository import ResgateRepository
from services.historico.criar_historico_crianca_service import CriarHistoricoCriancaService
from exceptions import DadosInvalidos, NaoEncontrado
 
 
class ComprarRecompensaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)
        self.recompensa_repo = RecompensaRepository(conexao)
        self.resgate_repo = ResgateRepository(conexao)
        self.historico_service = CriarHistoricoCriancaService(conexao)
 
    def comprar_recompensa(self, crianca_id, recompensa_id):
        crianca = self.crianca_repo.buscar_por_id(crianca_id)
        if not crianca:
            raise NaoEncontrado("Criança não encontrada.")
 
        recompensa = self.recompensa_repo.buscar_por_id(recompensa_id)
        if not recompensa:
            raise NaoEncontrado("Recompensa não encontrada.")
 
        if crianca.moedas < recompensa.custo_moedas:  
            raise DadosInvalidos("Saldo insuficiente para essa recompensa.")
 
        try:
            novo_saldo = crianca.moedas - recompensa.custo_moedas 
            self.crianca_repo.atualizar(crianca_id, {"moedas": novo_saldo})
 
            resgate = Resgate(
                nome=recompensa.nome,
                crianca_id=crianca_id,
                recompensa_id=recompensa_id,
                custo=recompensa.custo_moedas, 
            )
            resgate_id = self.resgate_repo.criar(resgate.para_insercao())
 
            self.historico_service.criar_historico(
                crianca_id=crianca_id,
                tipo_valor="saida",
                origem="resgate",
                valor=recompensa.custo_moedas, 
                titulo=f"Resgate: {recompensa.nome}", 
            )
 
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise
 
        return resgate_id