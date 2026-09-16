from repositories.responsavel_repository import ResponsavelRepository

class ListarResponsavelService:
    def __init__(self, conexao):
        self.responsavel_repo = ResponsavelRepository(conexao)

    def por_conta(self, conta_id):
        responasveis = self.responsavel_repo.buscar_responsavels_por_conta(conta_id)
        return [responsavel.to_dict() for responsavel in responasveis]