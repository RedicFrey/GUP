from flask import Blueprint, jsonify, request, session, g
from services.family_account.create_family_account_service import FamilyAccountCreationService
from services.profile.profile_registration_service import FamilyAccountRegistrationService
# from services.usuario.criar_usuario_service import CriarUsuarioService
# from services.usuario.criar_usuario_admin_service import CriarUsuarioAdminService
from services.family_account.family_profile_listing_service import FamilyProfileListingService
from services.family_account.singin_family_account import LoginService
from services.profile.login_service import ProfileLoginService
from services.profile.profile_info_service import ProfileInfoService
# from services.conta_familia.finalizar_cadastro_familia_service import FinalizarCadastroFamiliaService
from exceptions import NotFound, InvalidData
from utils.auth import family_login_required, profile_required, admin_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/cadastro')
def sign_up():
    connection = g.connection

    dados = request.get_json(silent=True) or {}

    service_account = FamilyAccountCreationService(connection)
    profile_admin, family_account = service_account.create_family_account(dados)

    session["family_account_id"] = family_account["id"]
    session["profile_id"] = profile_admin["id"]
    session["profile_type"] = "responsible"
    session["is_admin"] = True

    return jsonify({"profile_admin":profile_admin, "family_account": family_account}), 201


@auth_bp.post('/login')
def sign_in():

    connection = g.connection

    data = request.get_json(silent=True) or {}

    service_login = LoginService(connection)
    family_account = service_login.auth(data)

    session.clear()
    session["family_account_id"] = family_account.id

    return jsonify({
        "message": "Login realizado com sucesso!",
        "family_account_id": family_account.id
    }), 200


@auth_bp.get('/conta-familia/perfis')
@family_login_required
def show_profiles():

    connection = g.connection

    family_account_id = session.get("family_account_id")

    service_profiles = FamilyProfileListingService(connection)
    response = service_profiles.list(family_account_id)

    return jsonify({"profiles": response}), 200


@auth_bp.post('/escolher-perfil/<profile_id>')
@family_login_required
def choose_profile(profile_id):

    connection = g.connection
    data = request.get_json() or {}
    family_account_id = session.get("family_account_id")
    pin = data.get("pin")

    service_profiles = ProfileLoginService(connection)
    profile = service_profiles.select_profile(family_account_id, profile_id, pin)

    session["profile_id"] = profile["id"]
    session["profile_type"] = profile["profile_type"]
    session["is_admin"] = profile.get("role") == "admin"
    print(session.get("profile_id"))
    print(session.get("profile_type"))
    print("olá mundo")

    return jsonify(profile), 200


@auth_bp.get("/perfil/me")
@profile_required
def me():
    connection = g.connection
    service_me = ProfileInfoService(connection)
    return jsonify(service_me.get(session["profile_id"])), 200

@auth_bp.post('/logout')
def logout():
    session.clear()
    return jsonify({"mensagem": "Sessão encerrada com sucesso."}), 200
