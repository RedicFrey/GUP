from datetime import datetime
from repositories.tarefa_repository import TarefaRepository
from exceptions import NaoEncontrado

class ListarTarefasPorResponsavelService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.tarefa_repo = TarefaRepository(conexao)

    def listar_tarefas(self, responsavel_id, status=None):
        try:
            tarefas = self.tarefa_repo.listar_por_responsavel(responsavel_id, status)
        except Exception as e:
            raise NaoEncontrado("Não foi possivel listar as tarefas") from e

        agora = datetime.now()
        tarefas_dict = []
        for t in tarefas:
            dict_tarefa = t.to_dict()
            dict_tarefa["atrasada"] = (
                t.status == "pendente" and t.horario_limite < agora
            )
            tarefas_dict.append(dict_tarefa)

        return {
            "pendentes": [t for t in tarefas_dict if not t["atrasada"] and t["status"] == "pendente"],
            "atrasadas": [t for t in tarefas_dict if t["atrasada"]],
            "em_analise": [t for t in tarefas_dict if t["status"] == "espera"],
            "concluidas": [t for t in tarefas_dict if t["status"] == "concluida"],
        }