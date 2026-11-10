from . import db
from .base import ModeloBase, ComDatas


class GiraffeItemModel(ModeloBase, ComDatas):
    """Item de personalização da girafa, liberado a partir de required_level.

    É a base (abstrata) das três tabelas de itens: cor, fundo e acessório.
    """

    __abstract__ = True

    name = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    required_level = db.Column(db.Integer, nullable=False, default=1, server_default="1")

    ITEM_TYPE = None

    @classmethod
    def listar_todos(cls):
        # mesma ordem de antes: do mais fácil ao mais difícil de liberar
        return db.session.scalars(
            db.select(cls).order_by(cls.required_level.asc(), cls.id.asc())
        ).all()

    def is_unlocked_for(self, level):
        print(level)
        return self.required_level <= (level or 1)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
            "required_level": self.required_level,
        }

    def __repr__(self):
        return f"<{type(self).__name__} id={self.id} name={self.name!r} required_level={self.required_level}>"


class GiraffeColorModel(GiraffeItemModel):
    __tablename__ = "giraffe_colors"
    ITEM_TYPE = "color"

    giraffes = db.relationship("GiraffeModel", back_populates="color")


class GiraffeBackgroundModel(GiraffeItemModel):
    __tablename__ = "giraffe_backgrounds"
    ITEM_TYPE = "background"

    giraffes = db.relationship("GiraffeModel", back_populates="background")


class GiraffeAccessoryModel(GiraffeItemModel):
    __tablename__ = "giraffe_accessories"
    ITEM_TYPE = "accessory"

    giraffes = db.relationship("GiraffeModel", back_populates="accessory", passive_deletes=True)


# tipo usado na URL (/girafas/itens/<tipo>) -> Model
GIRAFFE_ITEM_MODELS = {
    model.ITEM_TYPE: model
    for model in (GiraffeColorModel, GiraffeBackgroundModel, GiraffeAccessoryModel)
}
