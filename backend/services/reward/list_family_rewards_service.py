from models.child_model import ChildProfile
from models.reward_model import RewardModel
from exceptions import NotFound


class ListFamilyRewardsService:
    """Recompensas da família. Para a criança, também devolve o saldo e a meta dela."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, family_account_id: int, profile_id: int, profile_type: str) -> dict:
        auth_child = None
        if profile_type == "child":
            child = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
            if child is None:
                raise NotFound("Perfil de criança não encontrado.")
            auth_child = child.to_dict()

        rewards = RewardModel.listar_por_familia(family_account_id)

        return {
            "rewards": [reward.to_dict() for reward in rewards],
            "auth_child": auth_child,
            "profile_type": profile_type,
        }
