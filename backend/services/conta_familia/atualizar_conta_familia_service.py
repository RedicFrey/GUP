from werkzeug.security import generate_password_hash
from repositories.conta_familia_repository import ContaFamiliaRepository
from exceptions import NaoEncontrado

class AtualizarContaFamiliaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.conta_familia_repo = ContaFamiliaRepository(conexao)

    def atualizar_conta(self, conta_familia_id, dados):
        conta_familia = self.conta_familia_repo.buscar_por_id(conta_familia_id)
        if conta_familia is None:
            raise NaoEncontrado("Não foi possível encontrar a conta família")

        dados_atualizar = {}
        if dados.get("nome"):
            dados_atualizar["nome"] = dados["nome"]
        if dados.get("pin"):
            dados_atualizar["pin"] = generate_password_hash(dados["pin"])

        try:
            self.conta_familia_repo.atualizar(conta_familia_id, dados_atualizar)
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.conta_familia_repo.buscar_por_id(conta_familia_id).to_dict()