from flask import Blueprint, jsonify, request, session, g
from utils.auth import profile_required, responsible_required, admin_required
# from services.conta_familia.atualizar_conta_familia_service import AtualizarContaFamiliaService
# from services.conta_familia.deletar_conta_familia_service import DeletarContaFamiliaService
from services.profile.profile_info_service import ProfileInfoService
from services.family_account.family_profile_listing_service import FamilyProfileListingService
from services.profile.update_profile_service import ProfileUpdatedService
from services.child.list_children_service import FamilySChildren
from services.profile.delete_profile_service import DeleteProfileService
from services.profile.create_profile_service import ProfileCreationService
from exceptions import InvalidData

profile_bp = Blueprint("perfis", __name__, url_prefix="/perfis-conta-familia")

# @profile_bp.get('/')
# @profile_required
# def profiles():
#     connection = g.connection

#     family_account_id = session.get("family_account_id")

#     service_profiles = FamilyProfileListingService(connection)
#     profiles = service_profiles.list(family_account_id)

#     is_admin = session.get("is_admin")

#     print(session.get("profile_id"))
#     return jsonify({"profile_type": session.get("profile_type"), "profiles": profiles, "is_admin": is_admin}), 200

@profile_bp.post('/adicionar')
@responsible_required
def create_profile():

    connection = g.connection

    data = request.get_json() or {}
    if not data:
        raise InvalidData("O conteúdo na hora de criar o perfil veio vazio")
    
    service_profile = ProfileCreationService(connection)

    perfil_id = service_profile.create_profile(
        family_account_id=session["family_account_id"],
        data=data,
        created_by=session.get("profile_id"),
        is_admin=session.get("is_admin", False), 
    )

    return jsonify({"sucesso": True, "perfil_id": perfil_id}), 201

@profile_bp.put('/atualizar-perfil/<int:profile_id>')
@profile_required
def update_profile(profile_id):

    connection = g.connection
    data = request.get_json() or {}
    data_profile_id = data.get("profile_id")
    if data_profile_id and data_profile_id!= profile_id:
        raise InvalidData("O perfil que você quis alterar não é o mesmo que o escolhido")
    service_profile = ProfileUpdatedService(connection)
    response = service_profile.execute(profile_id, data)
    return jsonify({"resultado": response}), 200

@profile_bp.delete('/deletar/<int:profile_id>')
@admin_required
def delete_profile(profile_id):

    connection = g.connection
    service_profile = DeleteProfileService(connection)
    response = service_profile.delete(profile_id)
    return jsonify({"resultado": response}), 200

@profile_bp.get('/criancas')
@responsible_required
def list_children():

    connection = g.connection
    family_account_id = session.get("family_account_id")
    service_criancas = FamilySChildren(connection)
    children = service_criancas.execute(family_account_id)
    return jsonify(children), 200


@profile_bp.get('/perfil/<int:profile_id>')
@admin_required
def list_profile(profile_id):
  connection = g.connection
  profile_service = ProfileInfoService(connection)
  profile = profile_service.get(profile_id)
  return jsonify({"profile": profile}), 200
