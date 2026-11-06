from . import db
from .base import ModeloBase, ComDatas


class LevelModel(ModeloBase, ComDatas):
    """Nível da criança e o XP mínimo para chegar nele."""

    __tablename__ = "levels"

    level = db.Column(db.Integer, nullable=False, unique=True)
    xp_required = db.Column(db.Integer, nullable=False)

    children = db.relationship("ChildProfile", back_populates="level", passive_deletes=True)

    def to_dict(self):
        return {"id": self.id, "level": self.level, "xp_required": self.xp_required}

    def __repr__(self):
        return f"<LevelModel id={self.id} level={self.level} xp_required={self.xp_required}>"
