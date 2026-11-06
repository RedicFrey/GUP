from controllers.base_controller import BaseController
from utils.auth import profile_required, responsible_required, child_required
from services.reward.list_family_rewards_service import ListFamilyRewardsService
from services.reward.create_reward_service import CreateRewardService
from services.reward.delete_reward_service import DeleteRewardService
from services.reward.buy_reward_service import BuyRewardService
from services.reward.set_child_goal_service import SetChildGoalService
from services.reward.get_child_goal_service import GetChildGoalService
from services.reward.remove_child_goal_service import RemoveChildGoalService


class RewardController(BaseController):
    """Recurso: recompensas da família, compra e meta da criança."""

    NAME = "rewards"
    URL_PREFIX = "/recompensas"

    def register_routes(self):
        self.route("/", self.listar, ["GET"], profile_required)
        self.route("/criar", self.criar, ["POST"], responsible_required)
        self.route("/deletar/<int:reward_id>", self.excluir, ["DELETE"], responsible_required)
        self.route("/comprar/<int:reward_id>", self.comprar, ["POST"], child_required)
        self.route("/definir-meta/<int:reward_id>", self.definir_meta, ["POST"], child_required)
        self.route("/meta", self.ver_meta, ["GET"], child_required)
        self.route("/meta", self.remover_meta, ["DELETE"], child_required)

    def listar(self):
        result = ListFamilyRewardsService(self.connection).execute(
            self.family_account_id, self.profile_id, self.profile_type
        )
        return self.responder(result)

    def criar(self):
        reward = CreateRewardService(self.connection).execute(self.family_account_id, self.dados_json())
        return self.responder({"reward": reward}, 201)

    def excluir(self, reward_id):
        DeleteRewardService(self.connection).execute(reward_id, self.family_account_id)
        return self.sem_conteudo()

    def comprar(self, reward_id):
        child = BuyRewardService(self.connection).execute(self.profile_id, self.family_account_id, reward_id)
        return self.responder(child)

    def definir_meta(self, reward_id):
        child = SetChildGoalService(self.connection).execute(self.profile_id, self.family_account_id, reward_id)
        return self.responder(child)

    def ver_meta(self):
        return self.responder(GetChildGoalService(self.connection).execute(self.profile_id, self.family_account_id))

    def remover_meta(self):
        return self.responder(RemoveChildGoalService(self.connection).execute(self.profile_id, self.family_account_id))
