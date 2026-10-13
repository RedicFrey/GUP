
class CoinHistoryModel:
    def __init__(self, name, source, amount_type, amount, child_profile_id, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.source = source
        self.amount_type = amount_type
        self.amount = amount
        self.child_profile_id = child_profile_id
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "source": self.source,
            "amount_type": self.amount_type,
            "amount": self.amount,
            "child_profile_id": self.child_profile_id,
            "created_at": str(self.created_at) if self.created_at else None,
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "source": self.source,
            "amount_type": self.amount_type,
            "amount": self.amount,
            "child_profile_id": self.child_profile_id
        }
