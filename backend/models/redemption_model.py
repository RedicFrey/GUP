
class RedemptionModel:
    def __init__(self, name, amount, child_profile_id, reward_id, id=None,
                 created_at=None, updated_at=None, status=None):
        self.id = id
        self.name = name
        self.status = status
        self.amount = amount
        self.child_profile_id = child_profile_id
        self.reward_id = reward_id
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "amount": self.amount,
            "child_profile_id": self.child_profile_id,
            "reward_id": self.reward_id,
            "created_at": str(self.created_at) if self.created_at else None,
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "amount": self.amount,
            "child_profile_id": self.child_profile_id,
            "reward_id": self.reward_id
        }
