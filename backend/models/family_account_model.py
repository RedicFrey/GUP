from . import db
from .base import ModeloBase, ComDatas


class FamilyAccountModel(ModeloBase, ComDatas):
    """Conta família: é ela que faz login com e-mail e senha e reúne os perfis."""

    __tablename__ = "family_accounts"

    name = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    birth_date = db.Column(db.Date, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # apagar a conta apaga tudo dela (ON DELETE CASCADE no banco)
    profiles = db.relationship(
        "ProfileModel", back_populates="family_account",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    rewards = db.relationship(
        "RewardModel", back_populates="family_account",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    tasks = db.relationship(
        "TaskModel", back_populates="family_account",
        cascade="all, delete-orphan", passive_deletes=True,
    )
    events = db.relationship(
        "EventModel", back_populates="family_account",
        cascade="all, delete-orphan", passive_deletes=True,
    )

    MIN_NAME_LENGTH = 2
    MAX_NAME_LENGTH = 30   # VARCHAR(30) no schema

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
        }

    def __repr__(self):
        return f"<FamilyAccountModel id={self.id} email={self.email!r}>"
