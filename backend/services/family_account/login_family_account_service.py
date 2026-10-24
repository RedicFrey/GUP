
from werkzeug.security import check_password_hash

from repositories.family_account_repository import FamilyAccountRepository
from exceptions import InvalidData, NotFound

class LoginFamilyAccountService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.family_account_repo = FamilyAccountRepository(conexao)

    def execute(self, data: dict) -> dict:
        required_fields = ["email", "password"]
        for field in required_fields:
            if not data.get(field):
                raise InvalidData("E-mail e senha são obrigatórios.")

        family_account = self.family_account_repo.find_by_email(data["email"])
        if family_account is None:
            raise NotFound("Nenhuma conta encontrada com esse e-mail")

        if not family_account or not check_password_hash(family_account.password_hash, data["password"]):
            raise InvalidData("E-mail ou senha inválidos.")

        return family_account
