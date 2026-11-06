from models import db
from models.reward_model import RewardModel
from exceptions import InvalidData
from utils.validators import validate_positive_int, validate_text


class CreateRewardService:
    """O responsável cadastra uma recompensa (nome e custo em moedas)."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, family_account_id: int, data: dict) -> dict:
        name = validate_text(data.get("name"), "O nome", max_length=RewardModel.MAX_NAME_LENGTH)

        amount = data.get("amount")
        if amount is None or amount == "":
            raise InvalidData("O custo em moedas é obrigatório.")
        if isinstance(amount, float):
            raise InvalidData("O custo em moedas deve ser um número inteiro.")
        amount = validate_positive_int(amount, "O custo em moedas", maximum=RewardModel.MAX_AMOUNT)

        reward = RewardModel(name=name, amount=amount, family_account_id=family_account_id)
        reward.salvar()
        db.session.commit()

        return reward.to_dict()
