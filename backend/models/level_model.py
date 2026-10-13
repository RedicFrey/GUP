
class LevelModel:
    def __init__(self, required_xp, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.required_xp = required_xp
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "required_xp": self.required_xp,
        }

    def to_insertion(self):
        return {
            "required_xp": self.required_xp,
        }

