from repositories.tarefa_repository import TarefaRepository
from exceptions import NaoEncontrado

class ListarTarefasPorCriancaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.tarefa_repo = TarefaRepository(conexao)

    def listar_tarefas(self, crianca_id, status=None):
        try:
            tarefas = self.tarefa_repo.listar_por_crianca(crianca_id, status)
        except Exception as e:
            raise NaoEncontrado("Não foi possivel listar as tarefas") from e
        return [t.to_dict() for t in tarefas]