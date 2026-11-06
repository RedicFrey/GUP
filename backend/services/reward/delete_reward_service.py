from models import db
from models.reward_model import RewardModel
from exceptions import NotFound


class DeleteRewardService:
    """O responsável exclui uma recompensa da família.

    Os resgates já feitos continuam no histórico, e a meta das crianças que
    apontava para ela fica vazia (ON DELETE SET NULL no schema).
    """

    def __init__(self, connection):
        self.connection = connection

    def execute(self, reward_id: int, family_account_id: int) -> bool:
        reward = RewardModel.buscar_por_id_e_familia(reward_id, family_account_id)
        if reward is None:
            raise NotFound("Recompensa não encontrada.")

        reward.deletar()
        db.session.commit()
        return True
