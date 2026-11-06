from flask import session

from controllers.base_controller import BaseController
from utils.auth import family_login_required, profile_required, responsible_required, admin_required
from services.profile.list_family_profiles_service import ListFamilyProfilesService
from services.profile.login_profile_service import LoginProfileService
from services.profile.get_profile_service import GetProfileService
from services.profile.create_profile_service import CreateProfileService
from services.profile.update_profile_service import UpdateProfileService
from services.profile.delete_profile_service import DeleteProfileService
from services.child.list_children_service import ListChildrenService


class ProfileController(BaseController):
    """Recurso: perfis da conta família (responsáveis e crianças)."""

    NAME = "profiles"
    URL_PREFIX = "/perfis-conta-familia"

    def register_routes(self):
        self.route("/listar", self.listar, ["GET"], family_login_required)
        self.route("/escolher/<int:target_profile_id>", self.escolher, ["POST"], family_login_required)
        self.route("/me", self.eu, ["GET"], profile_required)
        self.route("/criancas", self.listar_criancas, ["GET"], profile_required)
        self.route("/perfil/<int:target_profile_id>", self.ver, ["GET"], admin_required)
        self.route("/adicionar", self.criar, ["POST"], responsible_required)
        self.route("/atualizar-perfil/<int:target_profile_id>", self.atualizar, ["PUT"], profile_required)
        self.route("/deletar/<int:target_profile_id>", self.excluir, ["DELETE"], admin_required)

    def listar(self):
        return self.responder(ListFamilyProfilesService(self.connection).execute(self.family_account_id))

    def escolher(self, target_profile_id):
        profile = LoginProfileService(self.connection).execute(
            family_account_id=self.family_account_id,
            profile_id=target_profile_id,
            pin=self.dados_json().get("pin"),
        )

        session["profile_id"] = profile["id"]
        session["profile_type"] = profile["profile_type"]
        session["is_admin"] = profile["role"] == "admin"

        return self.responder(profile)

    def eu(self):
        return self.responder(GetProfileService(self.connection).execute(self.profile_id, self.family_account_id))

    def listar_criancas(self):
        return self.responder(ListChildrenService(self.connection).execute(self.family_account_id))

    def ver(self, target_profile_id):
        profile = GetProfileService(self.connection).execute(target_profile_id, self.family_account_id)
        return self.responder({"profile": profile})

    def criar(self):
        profile = CreateProfileService(self.connection).execute(
            family_account_id=self.family_account_id,
            creator_id=self.profile_id,
            data=self.dados_json(),
        )
        return self.responder({"sucesso": True, "perfil_id": profile}, 201)

    def atualizar(self, target_profile_id):
        result = UpdateProfileService(self.connection).execute(
            target_profile_id=target_profile_id,
            family_account_id=self.family_account_id,
            editor_id=self.profile_id,
            editor_is_admin=self.is_admin,
            data=self.dados_json(),
        )
        return self.responder({"resultado": result})

    def excluir(self, target_profile_id):
        result = DeleteProfileService(self.connection).execute(
            target_profile_id=target_profile_id,
            family_account_id=self.family_account_id,
            admin_id=self.profile_id,
        )
        return self.responder({"resultado": result})
