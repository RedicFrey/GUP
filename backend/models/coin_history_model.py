from . import db
from .base import ModeloBase, ComDatas
from exceptions import InvalidData


class CoinHistoryModel(ModeloBase, ComDatas):
    """Entrada ou saída de moedas de uma criança. amount é sempre positivo."""

    CREDIT = "credit"
    DEBIT = "debit"
    AMOUNT_TYPES = (CREDIT, DEBIT)

    TASK = "task"
    REDEMPTION = "redemption"
    MANUAL_ADJUSTMENT = "manual_adjustment"
    SOURCES = (TASK, REDEMPTION, MANUAL_ADJUSTMENT)

    MAX_NAME_LENGTH = 50   # VARCHAR(50) no schema

    __tablename__ = "coin_history"
    __table_args__ = (db.CheckConstraint("amount >= 0", name="chk_coin_history_amount"),)

    name = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    source = db.Column(db.Enum(*SOURCES, name="coin_history_source"), nullable=False)
    amount_type = db.Column(db.Enum(*AMOUNT_TYPES, name="coin_history_amount_type"), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    child_profile_id = db.Column(
        db.Integer, db.ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False,
    )

    child = db.relationship("ChildProfile", back_populates="coin_history")

    def __init__(self, **kwargs):
        kwargs["name"] = self.fit_name(kwargs.get("name"))
        super().__init__(**kwargs)

    @classmethod
    def fit_name(cls, name):
        """Corta nomes longos (ex.: "Tarefa concluída: <nome da tarefa>") para caber na coluna."""
        name = (name or "").strip()
        if len(name) > cls.MAX_NAME_LENGTH:
            name = name[: cls.MAX_NAME_LENGTH - 1].rstrip() + "…"
        return name

    def validate(self):
        if self.amount_type not in self.AMOUNT_TYPES:
            raise InvalidData(f"O tipo do valor deve ser um destes: {', '.join(self.AMOUNT_TYPES)}.")
        if self.source not in self.SOURCES:
            raise InvalidData(f"A origem deve ser uma destas: {', '.join(self.SOURCES)}.")
        if isinstance(self.amount, bool) or not isinstance(self.amount, int) or self.amount <= 0:
            raise InvalidData("O valor deve ser um inteiro positivo; o sinal vem do tipo do valor.")
        if not self.name:
            raise InvalidData("O nome do histórico é obrigatório.")

    def salvar(self):
        self.validate()
        return super().salvar()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "source": self.source,
            "amount_type": self.amount_type,
            "amount": self.amount,
            "child_profile_id": self.child_profile_id,
            "created_at": str(self.created_at) if self.created_at else None,
        }

    def __repr__(self):
        return (f"<CoinHistoryModel id={self.id} {self.amount_type} {self.amount} "
                f"child_profile_id={self.child_profile_id}>")
