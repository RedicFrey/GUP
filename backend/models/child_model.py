from models.profile_model import ProfileModel

class ChildProfile(ProfileModel):
    def __init__(self, coins=0, xp=0, level_id=None, seen_level=None, goal_id=None, strikes=0, **kwargs):
        kwargs["profile_type"] = "child"
        
        super().__init__(**kwargs)
        
        self.coins = coins
        self.xp = xp
        self.level_id = level_id
        self.goal_id = goal_id
        self.strikes = strikes
        self.seen_level = seen_level

    def to_dict(self):
        return {
            **super().to_dict(),
            "coins": self.coins,
            "xp": self.xp,
            "level_id": self.level_id,
            "goal_id": self.goal_id,
            "strikes": self.strikes,
            "seen_level": self.seen_level,
        }

    def to_insertion(self):
        return {
            **super().to_insertion(),
            "coins": self.coins,
            "xp": self.xp,
            "level_id": self.level_id,
            "goal_id": self.goal_id,
            "strikes": self.strikes,
            "seen_level": self.seen_level,
        }
