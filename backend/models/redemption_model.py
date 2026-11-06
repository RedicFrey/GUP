from . import db
from .base import ModeloBase, ComDatas


class RedemptionModel(ModeloBase, ComDatas):
    """Compra de uma recompensa por uma criança.

    name e amount são uma cópia da recompensa no momento da compra: o resgate
    continua no histórico mesmo se a recompensa for apagada.
    """

    PENDING = "pending"
    DONE = "done"
    STATUSES = (PENDING, DONE)

    __tablename__ = "redemptions"

    name = db.Column(db.String(30), nullable=False)
    status = db.Column(
        db.Enum(*STATUSES, name="redemption_status"),
        nullable=False, default=PENDING, server_default=PENDING,
    )
    amount = db.Column(db.Integer, nullable=False)
    child_profile_id = db.Column(
        db.Integer, db.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False,
    )
    reward_id = db.Column(db.Integer, db.ForeignKey("rewards.id", ondelete="SET NULL"), nullable=True)

    child = db.relationship("ChildProfile", back_populates="redemptions")
    reward = db.relationship("RewardModel", back_populates="redemptions")

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

    def __repr__(self):
        return f"<RedemptionModel id={self.id} name={self.name!r} status={self.status!r}>"
