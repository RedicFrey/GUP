from . import db
from .base import ModeloBase, ComDatas


class TaskModel(ModeloBase, ComDatas):
    """Tarefa criada por um responsável. Cada criança recebe a sua TaskAssignmentModel."""

    __tablename__ = "tasks"
    __table_args__ = (
        db.CheckConstraint("coins_reward >= 0", name="chk_tasks_coins"),
        db.CheckConstraint("xp_reward >= 0", name="chk_tasks_xp"),
    )

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.DateTime, nullable=False)
    coins_reward = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    xp_reward = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    required_proof = db.Column(db.Boolean, nullable=False, default=True, server_default=db.true())
    created_by = db.Column(db.Integer, db.ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    family_account_id = db.Column(
        db.Integer, db.ForeignKey("family_accounts.id", ondelete="CASCADE"), nullable=False,
    )

    family_account = db.relationship("FamilyAccountModel", back_populates="tasks")
    assignments = db.relationship(
        "TaskAssignmentModel", back_populates="task",
        cascade="all, delete-orphan", passive_deletes=True,
    )

    FAMILY_COLUMN = "family_account_id"
    MAX_NAME_LENGTH = 100        # VARCHAR(100) no schema
    MAX_DESCRIPTION_LENGTH = 1000
    MIN_DEADLINE_MINUTES = 30    # o prazo precisa estar pelo menos 30 min à frente

    @classmethod
    def ordenacao(cls):
        return [cls.deadline.asc(), cls.id.asc()]

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "deadline": str(self.deadline) if self.deadline else None,
            "coins_reward": self.coins_reward,
            "xp_reward": self.xp_reward,
            "required_proof": bool(self.required_proof),
            "created_by": self.created_by,
            "family_account_id": self.family_account_id,
        }

    def __repr__(self):
        return f"<TaskModel id={self.id} name={self.name!r} deadline={self.deadline}>"
