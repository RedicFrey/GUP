from datetime import datetime
from models.tarefa_model import Tarefa
from exceptions import DadosInvalidos
from repositories.tarefa_repository import TarefaRepository
from repositories.crianca_repository import CriancaRepository

class CriarTarefaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.crianca_repo = CriancaRepository(conexao)
        self.tarefa_repo = TarefaRepository(conexao)

    def criar_tarefa(self, dados):
        campos_obrigatorios = ["titulo", "horario_limite", "crianca_id", "responsavel_id"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise DadosInvalidos(f"O campo '{campo}' é obrigatório.")

        self._validar_crianca_da_familia(dados["crianca_id"], dados["conta_id"])

        horario_limite = dados["horario_limite"]
        if isinstance(horario_limite, str):
            try:
                horario_limite = datetime.strptime(horario_limite, "%Y-%m-%dT%H:%M")
            except ValueError:
                raise DadosInvalidos("Formato de horário limite inválido.")

        tarefa = Tarefa(
            titulo=dados["titulo"],
            descricao=dados.get("descricao"),
            status=dados.get("status") or "pendente",
            horario_limite=horario_limite,
            crianca_id=dados["crianca_id"],
            responsavel_id=dados["responsavel_id"],
            conta_id=dados.get("conta_id"),
            xp_ganho=int(dados.get("xp_ganho") or 0),
            moedas_ganha=int(dados.get("moedas_ganha") or 0),
        )

        try:
            novo_id = self.tarefa_repo.criar(tarefa.para_insercao())
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        tarefa.id = novo_id
        return tarefa.to_dict()

    def _validar_crianca_da_familia(self, crianca_id, conta_id):
        criancas = self.crianca_repo.listar_por_conta(conta_id)
        ids_validos = {c["id"] for c in criancas}
        if int(crianca_id or 0) not in ids_validos:
            raise DadosInvalidos("Selecione uma criança válida da sua família.")