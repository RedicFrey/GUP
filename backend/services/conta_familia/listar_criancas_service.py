from repositories.crianca_repository import CriancaRepository

class ListarCriancasFamiliaService:
    def __init__(self, conexao):
        self.crianca_repo = CriancaRepository(conexao)

    def por_conta(self, conta_id):
        criancas = self.crianca_repo.buscar_criancas_por_conta(conta_id)
        return [crianca.to_dict() for crianca in criancas]