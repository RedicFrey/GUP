from functools import wraps
from flask import session, jsonify

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'usuario_id' not in session:
            return jsonify({"erro": "Você precisa estar logado para acessar essa rota."}), 401
        return f(*args, **kwargs)
    return wrapper


def familia_required(f):
    @wraps(f)
    @login_required
    def wrapper(*args, **kwargs):
        if not session.get('tem_familia'):
            return jsonify({"erro": "Você precisa fazer parte de uma família para acessar esta rota."}), 403
        return f(*args, **kwargs)
    return wrapper
