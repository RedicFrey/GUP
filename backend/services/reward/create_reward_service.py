from models.reward_model import RewardModel
from repositories.reward_repository import RewardRepository
from exceptions import InvalidData

class RewardCreationService:
    def __init__(self, connection):
        self.connection = connection
        self.recompensa_repo = RewardRepository(connection)

    def execute(self, family_account_id: int, data: dict) -> dict:
        if not data.get("name"):
            raise InvalidData(f"O campo de nome é obrigatório.")
        if not data.get("amount"):
            raise InvalidData(f"O campo de valor é obrigatório.")

        try:
            amount = int(data["amount"])
        except (TypeError, ValueError):
            raise InvalidData("Custo em moedas deve ser um número.")

        if amount <= 0:
            raise InvalidData("Custo em moedas deve ser maior que zero.")

        recompensa = RewardModel(
            name=data["name"],
            amount=amount,
            family_account_id=family_account_id,
        )

        try:
            new_id = self.recompensa_repo.create(recompensa.to_insertion())
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return self.recompensa_repo.find_by_id(new_id).to_dict()