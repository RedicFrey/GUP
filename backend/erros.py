from flask import jsonify
from mysql.connector import Error as MySQLError
from exceptions import NaoEncontrado, DadosInvalidos

def register_error_handlers(app):

    @app.errorhandler(DadosInvalidos)
    def dados_invalidos(e):
        return jsonify({"erro": str(e)}), 400

    @app.errorhandler(NaoEncontrado)
    def nao_encontrado(e):
        return jsonify({"erro": str(e)}), 404

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.exception("Erro inesperado")
        return jsonify({"erro": "Erro interno"}), 500

    @app.errorhandler(MySQLError)
    def handle_db_error(e):
        app.logger.error(f"Erro de banco: {e}")
        return jsonify({"erro": "Erro no banco de dados"}), 503