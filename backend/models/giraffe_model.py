from . import db
from .base import ModeloBase, ComDatas


class GiraffeModel(ModeloBase, ComDatas):
    """Girafa de uma criança, composta por uma cor, um fundo e (opcional) um acessório."""

    # o item de id 1 de cada tipo é o padrão de toda criança nova (seeds do schema.sql)
    DEFAULT_COLOR_ID = 1
    DEFAULT_BACKGROUND_ID = 1

    # campo do corpo da requisição -> tipo do item
    ITEM_FIELDS = {"color_id": "color", "background_id": "background", "accessory_id": "accessory"}
    OPTIONAL_FIELDS = ("accessory_id",)

    __tablename__ = "giraffes"

    child_profile_id = db.Column(
        db.Integer, db.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, unique=True,
    )
    color_id = db.Column(
        db.Integer, db.ForeignKey("giraffe_colors.id", ondelete="RESTRICT"),
        nullable=False, default=DEFAULT_COLOR_ID,
    )
    accessory_id = db.Column(
        db.Integer, db.ForeignKey("giraffe_accessories.id", ondelete="SET NULL"), nullable=True,
    )
    background_id = db.Column(
        db.Integer, db.ForeignKey("giraffe_backgrounds.id", ondelete="RESTRICT"),
        nullable=False, default=DEFAULT_BACKGROUND_ID,
    )

    child = db.relationship("ChildProfile", back_populates="giraffe")
    color = db.relationship("GiraffeColorModel", back_populates="giraffes")
    background = db.relationship("GiraffeBackgroundModel", back_populates="giraffes")
    accessory = db.relationship("GiraffeAccessoryModel", back_populates="giraffes")

    @staticmethod
    def _item_dict(item, item_id):
        if item_id is None:
            return None
        return {
            "id": item_id,
            "name": item.name if item else None,
            "image_url": item.image_url if item else None,
        }

    def to_dict(self):
        return {
            "id": self.id,
            "child_profile_id": self.child_profile_id,
            "color": self._item_dict(self.color, self.color_id),
            "background": self._item_dict(self.background, self.background_id),
            "accessory": self._item_dict(self.accessory, self.accessory_id),
        }

    def __repr__(self):
        return f"<GiraffeModel id={self.id} child_profile_id={self.child_profile_id}>"
