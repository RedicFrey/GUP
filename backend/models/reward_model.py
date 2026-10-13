
class RewardModel:
    def __init__(self, name, amount, family_account_id, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.amount = amount
        self.family_account_id = family_account_id
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "amount": self.amount,
            "family_account_id": self.family_account_id
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "amount": self.amount,
            "family_account_id": self.family_account_id
        }
