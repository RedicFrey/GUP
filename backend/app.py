import os

from datetime import date, datetime
from flask import Flask, jsonify, g, request
from flask_cors import CORS
from dotenv import load_dotenv
from flask.json.provider import DefaultJSONProvider

from database import get_connection
from controllers import all_blueprints
from erros import register_error_handlers

load_dotenv()

class AppJSONProvider(DefaultJSONProvider):
    @staticmethod
    def default(o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()    
        return DefaultJSONProvider.default(o)

def criar_app():
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    app.json = AppJSONProvider(app) 
    register_error_handlers(app)

    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

    if not app.config["SECRET_KEY"]:
        raise RuntimeError("SECRET_KEY não definida! Configure o arquivo .env")

    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False

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

    # ---- Conexão MySQL por requisição ----
    @app.before_request
    def abrir_conexao():
        if request.method == "OPTIONS":
            return
        g.connection = get_connection()

    @app.teardown_appcontext
    def fechar_conexao(exception=None):
        connection = g.pop("connection", None)
        if connection is not None:
            if exception is not None:
                connection.rollback()
            connection.close()

    @app.errorhandler(413)
    def arquivo_muito_grande(e):
        return jsonify({"erro": "O arquivo enviado excede o limite de 5MB."}), 413

    for blueprint in all_blueprints:
        app.register_blueprint(blueprint)

    @app.get("/")
    def home():
        return jsonify({
            "mensagem": "API do GUP (Flask + MySQL puro) funcionando.",
            "rotas": {
                "cadastro": "POST /usuarios/cadastro",
                "login_usuario": "POST /usuarios/login",
                "logout": "POST /usuarios/logout",
                "usuario_logado": "GET /usuarios/me",
                "criar_conta_familia": "POST /contas/criar",
                "login_conta_familia": "POST /contas/login",
                "info_conta_familia": "GET /contas/info",
                "dashboard": "GET /dashboard",
                "criar_tarefa_info": "GET /tarefas/criar-info",
                "criar_tarefa": "POST /tarefas/criar",
                "atualizar_status_tarefa": "POST /tarefas/<id>/status",
                "criar_evento": "POST /eventos",
                "historico": "GET /historico",
                "ajustar_moedas": "POST /criancas/<id>/ajustar-moedas",
                "recompensas": "GET|POST /recompensas",
                "comprar_recompensa": "POST /recompensas/comprar/<id>",
                "definir_meta": "POST /recompensas/meta/<id>",
                "relatorio": "GET /relatorio",
            }
        })
    

    # print(app.url_map)
    return app


app = criar_app()

if __name__ == '__main__':
    app.run(debug=True)