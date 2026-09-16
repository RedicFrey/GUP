from repositories.crianca_repository import CriancaRepository
from repositories.tarefa_repository import TarefaRepository
from exceptions import DadosInvalidos, NaoEncontrado

class RelatorioDesempenhoService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)
        self.tarefa_repo = TarefaRepository(conexao)

    def gerar(self, crianca_id, conta_id):
        crianca = self.crianca_repo.buscar_por_id(crianca_id)
        if not crianca:
            raise NaoEncontrado("Criança não encontrada.")

        if conta_id is not None and crianca.usuario.conta_id != conta_id:
            raise DadosInvalidos("Essa criança não pertence à sua família.")

        tarefas = self.tarefa_repo.listar_por_crianca(crianca_id)

        concluidas = [t for t in tarefas if t.status == "concluida"]
        pendentes = [t for t in tarefas if t.status == "pendente"]
        em_espera = [t for t in tarefas if t.status == "espera"]

        total = len(tarefas)
        total_concluidas = len(concluidas)
        taxa_conclusao = round((total_concluidas / total) * 100, 1) if total > 0 else 0

        moedas_ganhas = sum(t.moedas_ganha for t in concluidas)
        xp_ganho = sum(t.xp_ganho for t in concluidas)

        return {
            "crianca": crianca.to_dict(),
            "total_tarefas": total,
            "total_concluidas": total_concluidas,
            "total_pendentes": len(pendentes),
            "total_em_espera": len(em_espera),
            "taxa_conclusao": taxa_conclusao,
            "moedas_ganhas": moedas_ganhas,
            "xp_ganho": xp_ganho,
            "tarefas_concluidas": [t.to_dict() for t in sorted(concluidas, key=lambda t: t.data_conclusao or t.id, reverse=True)],
        }