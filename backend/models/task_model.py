
class TaskModel:
    def __init__(self, name, deadline, coins_reward, xp_reward, required_proof, 
                 created_by, family_account_id,
                 description=None, id=None, 
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.description = description
        self.deadline = deadline
        self.coins_reward = coins_reward
        self.xp_reward = xp_reward
        self.required_proof = required_proof
        self.created_by = created_by
        self.family_account_id = family_account_id
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "deadline": str(self.deadline) if self.deadline else None,
            "description": self.description,
            "coins_reward": self.coins_reward,
            "xp_reward": self.xp_reward,
            "required_proof": self.required_proof,
            "created_by": self.created_by,
            "family_account_id": self.family_account_id
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "description": self.description,
            "deadline": self.deadline,
            "coins_reward": self.coins_reward,
            "xp_reward": self.xp_reward,
            "required_proof": self.required_proof,
            "created_by": self.created_by,
            "family_account_id": self.family_account_id,
        }
