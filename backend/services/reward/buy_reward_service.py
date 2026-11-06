from models import db
from models.coin_history_model import CoinHistoryModel
from models.notification_preference_model import NotificationPreferenceModel
from models.redemption_model import RedemptionModel
from models.reward_model import RewardModel
from repositories.child_repository import ChildRepository
from services.notification.notify_responsibles_service import NotifyResponsiblesService
from exceptions import NotFound


class BuyRewardService:
    """A criança compra uma recompensa da família.

    Debita o saldo, cria o resgate pendente, registra a saída no histórico e,
    se a recompensa era a meta, limpa a meta.
    """

    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.notify_service = NotifyResponsiblesService(connection)

    def execute(self, profile_id: int, family_account_id: int, reward_id: int) -> dict:
        child = self.child_repo.find_for_update(profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        reward = RewardModel.buscar_por_id_e_familia(reward_id, family_account_id)
        if reward is None:
            raise NotFound("Recompensa não encontrada.")

        child.remove_coins(reward.amount)
        fields = {"coins": child.coins}
        if child.goal_id == reward.id:
            fields["goal_id"] = None
        child.atualizar(**fields)

        RedemptionModel(
            name=reward.name,
            amount=reward.amount,
            child_profile_id=child.id,
            reward_id=reward.id,
        ).salvar()

        CoinHistoryModel(
            name=f"Resgate: {reward.name}",
            source=CoinHistoryModel.REDEMPTION,
            amount_type=CoinHistoryModel.DEBIT,
            amount=reward.amount,
            child_profile_id=child.id,
        ).salvar()

        db.session.commit()

        self.notify_service.execute(
            NotificationPreferenceModel.REWARD_REDEEMED,
            family_account_id,
            "GUP: nova recompensa resgatada",
            f'{child.name} resgatou "{reward.name}" por {reward.amount} moedas.',
        )

        return child.to_dict()
