from . import db


class ModeloBase(db.Model):
    """CRUD comum a todas as Models, via SQLAlchemy ORM.

    salvar/atualizar/deletar NÃO fazem commit: só preparam a sessão
    (db.session.add / setattr / db.session.delete). Quem confirma
    (db.session.commit) é o Service, ao final do caso de uso.

    FAMILY_COLUMN: coluna que liga o registro a uma conta família, se houver
    (usada em buscar_por_id_e_familia e listar_por_familia).
    """

    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)

    FAMILY_COLUMN = None

    # ---------- instância ----------
    def salvar(self):
        db.session.add(self)
        db.session.flush()   # gera o id: os Services usam o id antes do commit
        return self.id

    def atualizar(self, **novos_valores):
        """Altera só colunas que existem na tabela. None é um valor válido (grava NULL)."""
        colunas = self.__table__.columns.keys()
        for campo, valor in novos_valores.items():
            if campo in colunas:
                setattr(self, campo, valor)
        return self

    def deletar(self):
        db.session.delete(self)

    # ---------- classe ----------
    @classmethod
    def listar_todos(cls):
        return db.session.scalars(db.select(cls).order_by(cls.id)).all()

    @classmethod
    def buscar_por_id(cls, id):
        return db.session.get(cls, id)

    @classmethod
    def ordenacao(cls):
        """Ordem usada em listar_por_familia (as Models sobrescrevem quando precisam)."""
        return [cls.id.desc()]

    @classmethod
    def buscar_por_id_e_familia(cls, id, family_account_id):
        """Igual a buscar_por_id, mas devolve None se o registro for de outra família."""
        coluna = cls._coluna_familia()
        return db.session.scalars(
            db.select(cls).where(cls.id == id, coluna == family_account_id)
        ).first()

    @classmethod
    def listar_por_familia(cls, family_account_id):
        coluna = cls._coluna_familia()
        return db.session.scalars(
            db.select(cls).where(coluna == family_account_id).order_by(*cls.ordenacao())
        ).all()

    @classmethod
    def _coluna_familia(cls):
        if cls.FAMILY_COLUMN is None:
            raise NotImplementedError(f"{cls.__name__} não pertence a uma família.")
        return getattr(cls, cls.FAMILY_COLUMN)

    def __repr__(self):
        return f"<{type(self).__name__} id={self.id}>"


class ComDatas:
    """Colunas created_at/updated_at (todas as tabelas, menos notification_preferences)."""

    created_at = db.Column(db.DateTime, nullable=False, server_default=db.text("CURRENT_TIMESTAMP"))
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP"),
        onupdate=db.func.now(),
    )
