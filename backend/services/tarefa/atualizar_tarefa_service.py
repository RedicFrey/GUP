from datetime import datetime
from repositories.tarefa_repository import TarefaRepository
from exceptions import NaoEncontrado

class AtualizarTarefaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.tarefa_repo = TarefaRepository(conexao)

    CAMPOS_PERMITIDOS = {
        "titulo": None,
        "descricao": None,
        "horario_limite": lambda v: datetime.strptime(v, "%Y-%m-%dT%H:%M") if isinstance(v, str) else v,
        "moedas_ganha": int,
        "xp_ganho": int,
    }

    def atualizar_tarefa(self, tarefa_id, dados):
        tarefa = self.tarefa_repo.buscar_por_id(tarefa_id)
        if tarefa is None:
            raise NaoEncontrado("Não foi possível encontrar a tarefa.")

        dados_atualizar = {}
        for campo, conversor in self.CAMPOS_PERMITIDOS.items():
            if campo not in dados or dados[campo] is None:
                continue
            valor = dados[campo]
            dados_atualizar[campo] = conversor(valor) if conversor else valor

        try:
            self.tarefa_repo.atualizar(tarefa_id, dados_atualizar)
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.tarefa_repo.buscar_por_id(tarefa_id).to_dict()