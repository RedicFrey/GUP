
from flask import Blueprint, jsonify, request, session, g
from services.family_account.create_family_account_service import CreateFamilyAccountService
from services.family_account.list_family_profiles_service import ListFamilyProfilesService
from services.family_account.login_family_account_service import LoginFamilyAccountService
from services.profile.login_profile_service import LoginProfileService
from services.profile.get_profile_service import GetProfileService
from utils.auth import family_login_required, profile_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/cadastro")
def sign_up():
    connection = g.connection

    data = request.get_json(silent=True) or {}

    service_account = CreateFamilyAccountService(connection)
    profile_admin, family_account = service_account.execute(data=data)

    session["family_account_id"] = family_account["id"]
    session["profile_id"] = profile_admin["id"]
    session["profile_type"] = "responsible"
    session["is_admin"] = True

    return jsonify(
        {"profile_admin": profile_admin, "family_account": family_account}
    ), 201


@auth_bp.post("/login")
def sign_in():

    connection = g.connection

    data = request.get_json(silent=True) or {}

    service_login = LoginFamilyAccountService(connection)
    family_account = service_login.execute(data=data)

    session.clear()
    session["family_account_id"] = family_account.id

    return jsonify({"message": "Login realizado com sucesso!"}), 200


# -- Parte da seção de escolha de perfis --
@auth_bp.get("/conta-familia/perfis")
@family_login_required
def show_profiles():

    connection = g.connection

    family_account_id = session.get("family_account_id")

    service_profiles = ListFamilyProfilesService(connection)
    response = service_profiles.list(family_account_id=family_account_id)

    return jsonify(response), 200


#  -- Perfil escolhido --
@auth_bp.post("/escolher-perfil/<profile_id>")
@family_login_required
def choose_profile(profile_id):

    connection = g.connection
    data = request.get_json() or {}
    family_account_id = session.get("family_account_id")
    pin = data.get("pin")

    service_profiles = LoginProfileService(connection)
    profile = service_profiles.select_profile(
        family_account_id=family_account_id, 
        profile_id=profile_id, 
        pin=pin
    )

    session["profile_id"] = profile["id"]
    session["profile_type"] = profile["profile_type"]
    session["is_admin"] = profile.get("role") == "admin"

    return jsonify(profile), 200


# -- Informações sobre mim --
@auth_bp.get("/perfil/me")
@profile_required
def me():
    connection = g.connection
    service_me = GetProfileService(connection)
    return jsonify(service_me.get(session["profile_id"])), 200


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"mensagem": "Sessão encerrada com sucesso."}), 200
