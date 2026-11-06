from models import db


class BaseRepository:
    """Base dos Repositories: consultas em SQL escrito à mão, sempre com parâmetros nomeados.

    Os Repositories só consultam. CRUD simples (inserir, atualizar, remover,
    buscar por id) fica nas Models, e o commit fica nos Services.

    Listas para IN (...) entram pelo argumento `listas` (nome dos parâmetros
    que recebem uma lista), que vira um bindparam "expanding": nada de
    concatenar valores na string do SQL.
    """

    def __init__(self, connection=None):
        # O parâmetro só existe para os Services continuarem chamando Repo(connection)
        # sem mudança. O acesso ao banco é sempre por db.session.
        pass

    # ---------- montagem ----------
    @staticmethod
    def _sql(sql, listas=()):
        consulta = db.text(sql)
        if listas:
            consulta = consulta.bindparams(*(db.bindparam(nome, expanding=True) for nome in listas))
        return consulta

    def _executar(self, sql, params=None, listas=()):
        # SQL puro (text) não dispara o autoflush: grava antes o que está pendente na
        # sessão para a consulta enxergar as alterações feitas pelo Service.
        db.session.flush()
        return db.session.execute(self._sql(sql, listas), params or {})

    @property
    def _for_update(self):
        """Trava as linhas lidas até o commit. O SQLite (modo de teste) não tem FOR UPDATE."""
        return " FOR UPDATE" if db.session.get_bind().dialect.name == "mysql" else ""

    # ---------- resultados como dicionário ----------
    def _buscar_um(self, sql, params=None, listas=()):
        """Primeira linha como dict, ou None."""
        linha = self._executar(sql, params, listas).mappings().first()
        return dict(linha) if linha is not None else None

    def _buscar_varios(self, sql, params=None, listas=()):
        """Todas as linhas como lista de dicts."""
        return [dict(linha) for linha in self._executar(sql, params, listas).mappings().all()]

    def _buscar_valor(self, sql, params=None, listas=()):
        """Primeira coluna da primeira linha (ex.: COUNT(*)), ou None."""
        return self._executar(sql, params, listas).scalar()

    # ---------- resultados como Model ----------
    def _buscar_modelos(self, modelo, sql, params=None, listas=()):
        """Executa o SQL e devolve instâncias da Model, já ligadas à sessão.

        Assim o Service pode chamar atualizar()/deletar() no que o Repository devolveu.
        O SQL precisa trazer as colunas da tabela da Model (ex.: SELECT p.* ...).
        """
        consulta = db.select(modelo).from_statement(self._sql(sql, listas))
        return list(db.session.scalars(consulta, params or {}).all())

    def _buscar_modelo(self, modelo, sql, params=None, listas=()):
        modelos = self._buscar_modelos(modelo, sql, params, listas)
        return modelos[0] if modelos else None
