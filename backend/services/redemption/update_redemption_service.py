
from repositories.redemption_repository import RedemptionRepository
from exceptions import NotFound, InvalidData

class RedemptionUpdateService():
    def __init__(self, connection):
        self.connection = connection
        self.redemption_repo = RedemptionRepository(connection)

    def execute(self, redemption_id: int, status: str) -> bool:
        redemption = self.redemption_repo.find_by_id(redemption_id)
        if redemption is None:
            raise NotFound("Criança não encontrada.")

        if status=="pending":
            new_value = {"status": "done"}
        else:
            new_value = {"status": "pending"}

        try:
            self.redemption_repo.update(redemption_id, new_value)
            self.connection.commit()
        except Exception as e:
            self.conexao.rollback()
            raise InvalidData("Não foi possível aplicar as alterações") from e

        return True