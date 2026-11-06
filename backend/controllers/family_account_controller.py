from flask import session

from controllers.base_controller import BaseController
from utils.auth import profile_required, admin_required
from services.family_account.create_family_account_service import CreateFamilyAccountService
from services.family_account.login_family_account_service import LoginFamilyAccountService
from services.family_account.get_family_account_service import GetFamilyAccountService
from services.family_account.delete_family_account_service import DeleteFamilyAccountService


class FamilyAccountController(BaseController):
    """Recurso: conta família (cadastro, login, logout, dados e exclusão)."""

    NAME = "family_account"

    def register_routes(self):
        self.route("/cadastro", self.cadastrar, ["POST"])
        self.route("/login", self.entrar, ["POST"])
        self.route("/logout", self.sair, ["POST"])
        self.route("/conta/info", self.ver, ["GET"], profile_required)
        self.route("/conta/deletar", self.excluir, ["DELETE"], admin_required)

    def cadastrar(self):
        result = CreateFamilyAccountService(self.connection).execute(self.dados_json())

        session.clear()
        session["family_account_id"] = result["family_account"]["id"]
        session["profile_id"] = result["profile_admin"]["id"]
        session["profile_type"] = result["profile_admin"]["profile_type"]
        session["is_admin"] = True

        return self.responder(result, 201)

    def entrar(self):
        family_account = LoginFamilyAccountService(self.connection).execute(self.dados_json())

        session.clear()
        session["family_account_id"] = family_account["id"]

        return self.responder({"message": "Login realizado com sucesso!"})

    def sair(self):
        session.clear()
        return self.responder({"mensagem": "Sessão encerrada com sucesso."})

    def ver(self):
        return self.responder(GetFamilyAccountService(self.connection).execute(self.family_account_id))

    def excluir(self):
        DeleteFamilyAccountService(self.connection).execute(
            family_account_id=self.family_account_id,
            profile_id=self.profile_id,
            password=self.dados_json().get("password"),
        )
        session.clear()
        return self.responder({"mensagem": "Conta família excluída com sucesso."})
