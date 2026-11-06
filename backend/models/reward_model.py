from . import db
from .base import ModeloBase, ComDatas


class RewardModel(ModeloBase, ComDatas):
    """Recompensa que a família oferece, com custo em moedas."""

    __tablename__ = "rewards"
    __table_args__ = (db.CheckConstraint("amount > 0", name="chk_rewards_amount"),)

    name = db.Column(db.String(30), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    family_account_id = db.Column(
        db.Integer, db.ForeignKey("family_accounts.id", ondelete="CASCADE"), nullable=False,
    )

    family_account = db.relationship("FamilyAccountModel", back_populates="rewards")
    # apagar a recompensa não apaga o resgate nem a criança (ON DELETE SET NULL no banco)
    redemptions = db.relationship("RedemptionModel", back_populates="reward", passive_deletes=True)
    children_with_goal = db.relationship("ChildProfile", back_populates="goal", passive_deletes=True)

    FAMILY_COLUMN = "family_account_id"
    MAX_NAME_LENGTH = 30   # VARCHAR(30) no schema
    MAX_AMOUNT = 100_000

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "amount": self.amount,
            "family_account_id": self.family_account_id,
        }

    def __repr__(self):
        return f"<RewardModel id={self.id} name={self.name!r} amount={self.amount}>"
