from models.recompensa_model import Recompensa
from repositories.recompensa_repository import RecompensaRepository
from exceptions import DadosInvalidos

class CriarRecompensaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.recompensa_repo = RecompensaRepository(conexao)

    def registrar_recompensa(self, dados):
        campos_obrigatorios = ["nome", "custo_moedas", "conta_id"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise DadosInvalidos(f"O campo '{campo}' é obrigatório.")

        try:
            custo_moedas = int(dados["custo_moedas"])
        except (TypeError, ValueError):
            raise DadosInvalidos("Custo em moedas deve ser um número.")

        if custo_moedas <= 0:
            raise DadosInvalidos("Custo em moedas deve ser maior que zero.")

        recompensa = Recompensa(
            nome=dados["nome"],
            custo_moedas=custo_moedas,
            conta_id=dados["conta_id"],
        )

        try:
            novo_id = self.recompensa_repo.criar(recompensa.para_insercao())
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.recompensa_repo.buscar_por_id(novo_id).to_dict()