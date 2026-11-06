from . import db
from .profile_model import ProfileModel
from exceptions import InvalidData


class ChildProfile(ProfileModel):

    PROFILE_TYPE = "child"
    __mapper_args__ = {"polymorphic_identity": PROFILE_TYPE}

    coins = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    xp = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    level_id = db.Column(db.Integer, db.ForeignKey("levels.id", ondelete="SET NULL"), nullable=True)
    seen_level = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    goal_id = db.Column(db.Integer, db.ForeignKey("rewards.id", ondelete="SET NULL"), nullable=True)
    strikes = db.Column(db.Integer, nullable=False, default=0, server_default="0")

    level = db.relationship("LevelModel", back_populates="children")
    goal = db.relationship("RewardModel", back_populates="children_with_goal")
    giraffe = db.relationship(
        "GiraffeModel", back_populates="child", uselist=False,
        cascade="all, delete-orphan", passive_deletes=True,
    )
    task_assignments = db.relationship(
        "TaskAssignmentModel", back_populates="child",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    coin_history = db.relationship(
        "CoinHistoryModel", back_populates="child",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    redemptions = db.relationship(
        "RedemptionModel", back_populates="child",
        cascade="all, delete-orphan", passive_deletes=True,
    )

    DEFAULT_LEVEL_ID = 1
    DEFAULT_SEEN_LEVEL = 1

    def to_dict(self):
        return {
            **super().to_dict(),
            "coins": self.coins,
            "xp": self.xp,
            "level_id": self.level_id,
            "seen_level": self.seen_level,
            "goal_id": self.goal_id,
            "strikes": self.strikes,
        }

    @staticmethod
    def _validate_amount(amount, what):
        if not isinstance(amount, int) or isinstance(amount, bool) or amount <= 0:
            raise InvalidData(f"A quantidade de {what} deve ser um número inteiro positivo.")

    def add_coins(self, amount) -> int:
        self._validate_amount(amount, "moedas")
        self.coins = (self.coins or 0) + amount
        return self.coins

    def remove_coins(self, amount) -> int:
        self._validate_amount(amount, "moedas")
        if (self.coins or 0) < amount:
            raise InvalidData("Saldo insuficiente: o saldo da criança não pode ficar negativo.")
        self.coins -= amount
        return self.coins

    def add_xp(self, amount) -> int:
        self._validate_amount(amount, "XP")
        self.xp = (self.xp or 0) + amount
        return self.xp
