from repositories.base_repository import BaseRepository
from models.tarefa_model import Tarefa

class TarefaRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="tarefas", modelo=Tarefa)

    def listar_por_crianca(self, crianca_id, status=None):
        cursor = self.conexao.cursor(dictionary=True)
        query = "SELECT * FROM tarefas WHERE crianca_id = %s"
        parametros = [crianca_id]

        if status:
            query += " AND status = %s"
            parametros.append(status)

        query += " ORDER BY horario_limite ASC"

        cursor.execute(query, tuple(parametros))
        resultados = cursor.fetchall()
        cursor.close()

        return [Tarefa(**linha) for linha in resultados]

    def listar_por_responsavel(self, responsavel_id, status=None):
        cursor = self.conexao.cursor(dictionary=True)
        query = "SELECT * FROM tarefas WHERE responsavel_id = %s"
        parametros = [responsavel_id]

        if status:
            query += " AND status = %s"
            parametros.append(status)

        query += " ORDER BY horario_limite ASC"

        cursor.execute(query, tuple(parametros))
        resultados = cursor.fetchall()
        cursor.close()

        return [Tarefa(**linha) for linha in resultados]