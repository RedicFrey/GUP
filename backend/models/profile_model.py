from . import db
from .base import ModeloBase, ComDatas


class ProfileModel(ModeloBase, ComDatas):
    """Perfil dentro da conta família. É a base de ChildProfile e ResponsibleProfile.

    As duas subclasses ficam na mesma tabela (profiles), separadas por profile_type
    (herança de tabela única do SQLAlchemy: a consulta já devolve a subclasse certa,
    e ChildProfile.buscar_por_id... só encontra perfis de criança).
    """

    __tablename__ = "profiles"

    family_account_id = db.Column(
        db.Integer, db.ForeignKey("family_accounts.id", ondelete="CASCADE"), nullable=False,
    )
    name = db.Column(db.String(20), nullable=False)
    profile_type = db.Column(db.Enum("child", "responsible", name="profile_type"), nullable=False)
    role = db.Column(db.String(20), nullable=True)
    notification_email = db.Column(db.String(100), nullable=True)
    pin_hash = db.Column(db.String(255), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)

    family_account = db.relationship("FamilyAccountModel", back_populates="profiles")
    notification_preferences = db.relationship(
        "NotificationPreferenceModel", back_populates="profile",
        cascade="all, delete-orphan", passive_deletes=True,
    )

    __mapper_args__ = {"polymorphic_on": profile_type}

    FAMILY_COLUMN = "family_account_id"
    ADMIN = "admin"
    PROFILE_TYPE = None   # definido pelas subclasses
    MAX_NAME_LENGTH = 20  # VARCHAR(20) no schema

    @classmethod
    def ordenacao(cls):
        return [cls.name.asc()]

    def has_pin(self):
        return self.pin_hash is not None

    def is_admin(self):
        return self.role == self.ADMIN

    def is_child(self):
        return self.profile_type == "child"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "profile_type": self.profile_type,
            "role": self.role,
            "has_pin": self.has_pin(),
            "created_by": self.created_by,
            "family_account_id": self.family_account_id,
        }

    def __repr__(self):
        return f"<{type(self).__name__} id={self.id} name={self.name!r}>"
