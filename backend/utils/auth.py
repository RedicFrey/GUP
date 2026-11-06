from functools import wraps

from flask import session, jsonify

from exceptions import Forbidden


def family_login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "family_account_id" not in session:
            return jsonify({"erro": "Você precisa fazer login primeiro."}), 401
        return f(*args, **kwargs)
    return wrapper


def profile_required(f):
    @wraps(f)
    @family_login_required
    def wrapper(*args, **kwargs):
        if "profile_id" not in session:
            return jsonify({"erro": "Escolha um perfil para continuar."}), 401
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    @wraps(f)
    @profile_required
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            raise Forbidden("Apenas o administrador pode fazer isso.")
        return f(*args, **kwargs)
    return wrapper


def responsible_required(f):
    @wraps(f)
    @profile_required
    def wrapper(*args, **kwargs):
        if session.get("profile_type") != "responsible":
            raise Forbidden("Apenas responsáveis podem acessar essa rota.")
        return f(*args, **kwargs)
    return wrapper


def child_required(f):
    @wraps(f)
    @profile_required
    def wrapper(*args, **kwargs):
        if session.get("profile_type") != "child":
            raise Forbidden("Apenas crianças podem acessar essa rota.")
        return f(*args, **kwargs)
    return wrapper
