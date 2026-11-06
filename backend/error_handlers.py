from flask import jsonify
from werkzeug.exceptions import HTTPException

from exceptions import InvalidData, Forbidden, NotFound


def register_error_handlers(app):
    """Converte as exceções em respostas JSON no formato {"erro": "..."}."""

    @app.errorhandler(InvalidData)
    def invalid_data(e):
        return jsonify({"erro": str(e)}), 400

    @app.errorhandler(Forbidden)
    def forbidden(e):
        return jsonify({"erro": str(e)}), 403

    @app.errorhandler(NotFound)
    def not_found(e):
        return jsonify({"erro": str(e)}), 404

    # erros de banco (SQLAlchemyError) são tratados em app.py

    @app.errorhandler(HTTPException)
    def http_error(e):
        if e.code == 413:
            return jsonify({"erro": "O arquivo enviado excede o limite de 5MB."}), 413
        return jsonify({"erro": e.description}), e.code

    @app.errorhandler(Exception)
    def unexpected_error(e):
        app.logger.exception("Erro inesperado: %s", e)
        return jsonify({"erro": "Erro interno"}), 500
