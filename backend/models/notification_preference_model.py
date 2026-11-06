from . import db
from .base import ModeloBase


class NotificationPreferenceModel(ModeloBase):
    """Se um responsável quer (enabled) receber um tipo de aviso por e-mail.

    A tabela não tem created_at/updated_at (igual ao schema.sql).
    """

    TASK_SUBMITTED = "task_submitted"
    REWARD_REDEEMED = "reward_redeemed"
    EVENT_CREATED = "event_created"
    TYPES = (TASK_SUBMITTED, REWARD_REDEEMED, EVENT_CREATED)

    # tipo no banco -> chave usada no JSON do front
    TYPE_KEYS = {
        TASK_SUBMITTED: "tasks",
        REWARD_REDEEMED: "redemptions",
        EVENT_CREATED: "events",
    }

    __tablename__ = "notification_preferences"
    __table_args__ = (db.UniqueConstraint("profile_id", "type"),)

    profile_id = db.Column(db.Integer, db.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    type = db.Column(db.Enum(*TYPES, name="notification_type"), nullable=False)
    enabled = db.Column(db.Boolean, nullable=False, default=False, server_default=db.false())

    profile = db.relationship("ProfileModel", back_populates="notification_preferences")

    def to_dict(self):
        return {"type": self.type, "enabled": bool(self.enabled)}

    def __repr__(self):
        return (f"<NotificationPreferenceModel profile_id={self.profile_id} "
                f"type={self.type!r} enabled={self.enabled}>")
