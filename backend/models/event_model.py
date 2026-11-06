from . import db
from .base import ModeloBase, ComDatas


class EventModel(ModeloBase, ComDatas):
    """Evento da agenda da família."""

    __tablename__ = "events"

    name = db.Column(db.String(30), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    family_account_id = db.Column(
        db.Integer, db.ForeignKey("family_accounts.id", ondelete="CASCADE"), nullable=False,
    )
    created_by = db.Column(db.Integer, db.ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)

    family_account = db.relationship("FamilyAccountModel", back_populates="events")

    FAMILY_COLUMN = "family_account_id"
    MAX_NAME_LENGTH = 30   # VARCHAR(30) no schema

    @classmethod
    def ordenacao(cls):
        return [cls.event_date.asc(), cls.id.asc()]

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_date": str(self.event_date) if self.event_date else None,
            "family_account_id": self.family_account_id,
            "created_by": self.created_by,
        }

    def __repr__(self):
        return f"<EventModel id={self.id} name={self.name!r} event_date={self.event_date}>"
