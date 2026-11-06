from . import db
from .base import ModeloBase, ComDatas


class TaskAssignmentModel(ModeloBase, ComDatas):
    """Uma tarefa entregue a uma criança, com o próprio status.

    Ciclo: pending -> awaiting_approval -> done (ou volta para pending se reprovada).
    "Atrasada" não é gravado: é pending com o prazo vencido.
    """

    PENDING = "pending"
    AWAITING_APPROVAL = "awaiting_approval"
    DONE = "done"
    NOT_DONE = "not_done"
    LATE = "late"   # só existe como filtro de listagem

    STATUSES = (PENDING, AWAITING_APPROVAL, DONE, NOT_DONE)

    __tablename__ = "task_assignments"
    __table_args__ = (db.UniqueConstraint("task_id", "child_profile_id"),)

    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    child_profile_id = db.Column(
        db.Integer, db.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False,
    )
    status = db.Column(
        db.Enum(*STATUSES, name="task_assignment_status"),
        nullable=False, default=PENDING, server_default=PENDING,
    )
    submitted_at = db.Column(db.DateTime, nullable=True)
    completion_date = db.Column(db.DateTime, nullable=True)
    proof_photo = db.Column(db.String(255), nullable=True)
    coins_earned = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    xp_earned = db.Column(db.Integer, nullable=False, default=0, server_default="0")

    task = db.relationship("TaskModel", back_populates="assignments")
    child = db.relationship("ChildProfile", back_populates="task_assignments")

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "child_profile_id": self.child_profile_id,
            "status": self.status,
            "submitted_at": str(self.submitted_at) if self.submitted_at else None,
            "completion_date": str(self.completion_date) if self.completion_date else None,
            "proof_photo": self.proof_photo,
            "coins_earned": self.coins_earned,
            "xp_earned": self.xp_earned,
        }

    def __repr__(self):
        return (f"<TaskAssignmentModel id={self.id} task_id={self.task_id} "
                f"child_profile_id={self.child_profile_id} status={self.status!r}>")
