from repositories.conta_familia_repository import ContaFamiliaRepository
from exceptions import NaoEncontrado

class DeletarContaFamiliaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.conta_familia_repo = ContaFamiliaRepository(conexao)

    def deletar_conta(self, conta_familia_id):
        conta_familia = self.conta_familia_repo.buscar_por_id(conta_familia_id)
        if conta_familia is None:
            raise NaoEncontrado("Conta família não pode ser encontrada")

        try:
            self.conta_familia_repo.deletar(conta_familia_id)
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return True