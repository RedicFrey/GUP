from repositories.tarefa_repository import TarefaRepository
from exceptions import NaoEncontrado

class DeletarTarefaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.tarefa_repo = TarefaRepository(conexao)

    def deletar_tarefa(self, tarefa_id):
        tarefa = self.tarefa_repo.buscar_por_id(tarefa_id)
        if tarefa is None:
            raise ValueError("Tarefa não encontrada.")

        try:
            self.tarefa_repo.deletar(tarefa_id)
            self.conexao.commit()
        except Exception as e:
            self.conexao.rollback()
            raise NaoEncontrado("Não foi possível deletar essa tarefa") from e

        return True