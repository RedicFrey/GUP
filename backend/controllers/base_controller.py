from flask import Blueprint, g, jsonify, request, session


class BaseController:
    """Base das Controllers.

    Cada Controller é uma classe ligada a um recurso, com um Blueprint próprio e um
    método por ação. A ação só lê a requisição, chama o Service e devolve a resposta.
    Erros dos Services (InvalidData, NotFound, Forbidden) viram JSON em error_handlers.py.
    """

    NAME = None          # nome do Blueprint
    URL_PREFIX = None    # prefixo das rotas (None = sem prefixo)

    def __init__(self):
        self.blueprint = Blueprint(self.NAME, __name__, url_prefix=self.URL_PREFIX)
        self.register_routes()

    def register_routes(self):
        raise NotImplementedError

    def route(self, rule, action, methods, guard=None, endpoint=None, **options):
        """Registra uma ação. guard é o decorator de acesso (ex.: responsible_required)."""
        view = guard(action) if guard else action
        self.blueprint.add_url_rule(
            rule, endpoint or action.__name__, view, methods=methods, **options
        )

    # ---------- sessão ----------
    @property
    def connection(self):
        return g.connection

    @property
    def family_account_id(self):
        return session.get("family_account_id")

    @property
    def profile_id(self):
        return session.get("profile_id")

    @property
    def profile_type(self):
        return session.get("profile_type")

    @property
    def is_admin(self):
        return bool(session.get("is_admin"))

    # ---------- requisição ----------
    @staticmethod
    def dados_json():
        dados = request.get_json(silent=True)
        return dados if isinstance(dados, dict) else {}

    @staticmethod
    def parametro(nome, tipo=None, padrao=None):
        """Valor da query string (?nome=...). Com tipo=int, valor inválido vira o padrão."""
        return request.args.get(nome, default=padrao, type=tipo)

    @staticmethod
    def arquivo(nome):
        return request.files.get(nome)

    # ---------- resposta ----------
    @staticmethod
    def responder(dados, status=200):
        return jsonify(dados), status

    @staticmethod
    def sem_conteudo():
        return "", 204
