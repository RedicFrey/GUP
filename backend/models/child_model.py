from models.profile_model import ProfileModel

class ChildProfile(ProfileModel):
    def __init__(self, coins=0, xp=0, level_id=None, seen_level=None, goal_id=None, strikes=0, **kwargs):
        # 1. Garante que 'profile_type' seja 'child', sobrescrevendo se o banco já mandou algo
        kwargs["profile_type"] = "child"
        
        # 2. Chama o pai apenas com o kwargs modificado
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

    # método que só faz sentido pra criança
    def complete_task(self, task_assignment):
        ...  # regra de negócio específica de "fazer" a tarefa