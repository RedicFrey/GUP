import os
from datetime import date, datetime

from dotenv import load_dotenv
from flask import Flask, jsonify, g, request
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError

from models import db
from controllers import create_blueprints
from error_handlers import register_error_handlers

load_dotenv()


class AppJSONProvider(DefaultJSONProvider):
    @staticmethod
    def default(o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return DefaultJSONProvider.default(o)


def endereco_do_banco():
    """URL do banco: DATABASE_URL do .env (MySQL) ou, sem ela, SQLite em backend/instance/ para testes.

    Ex.: DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/gup_db
    """
    url = os.environ.get("DATABASE_URL")
    if url:
        return url

    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "instance")
    os.makedirs(pasta, exist_ok=True)
    return "sqlite:///" + os.path.join(pasta, "gup.db").replace("\\", "/")


def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    app.json = AppJSONProvider(app)
    register_error_handlers(app)

    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
    if not app.config["SECRET_KEY"]:
        raise RuntimeError("SECRET_KEY não definida. Configure o arquivo .env (veja .env.example).")

    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SECURE"] = os.environ.get("SESSION_COOKIE_SECURE") == "1"

    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://127.0.0.1:5501",
            "http://localhost:5501",
        ],
    )

    app.config["SQLALCHEMY_DATABASE_URI"] = endereco_do_banco()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()   # cria só as tabelas que ainda não existem

    @app.errorhandler(SQLAlchemyError)
    def database_error(e):
        db.session.rollback()
        app.logger.error("Erro de banco: %s", e)
        return jsonify({"erro": "Erro ao acessar o banco de dados."}), 500

    @app.before_request
    def open_connection():
        if request.method == "OPTIONS":
            return
        # As Controllers repassam g.connection aos Services (assinatura antiga). O acesso ao
        # banco agora é sempre por db.session; no fim da requisição o Flask-SQLAlchemy
        # descarta a sessão e desfaz o que um Service não confirmou com commit.
        g.connection = db.session

    for blueprint in create_blueprints():
        app.register_blueprint(blueprint)

    @app.get("/")
    def home():
        return jsonify({"mensagem": "API do GUP funcionando."})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1")
