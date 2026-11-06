from werkzeug.security import check_password_hash

from repositories.family_account_repository import FamilyAccountRepository
from exceptions import InvalidData
from utils.login_attempts import family_login_attempts


class LoginFamilyAccountService:
    """Login da conta família com e-mail e senha.

    E-mail inexistente e senha errada dão a mesma resposta (não revela quais e-mails
    têm conta) e, depois de várias tentativas erradas, o e-mail fica bloqueado por um tempo.
    """

    def __init__(self, connection):
        self.connection = connection
        self.family_account_repo = FamilyAccountRepository(connection)

    def execute(self, data: dict):
        email = data.get("email")
        password = data.get("password")
        if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
            raise InvalidData("E-mail e senha são obrigatórios.")

        email = email.strip().lower()
        family_login_attempts.check(email)

        family_account = self.family_account_repo.find_by_email(email)
        if not family_account or not check_password_hash(family_account.password_hash, password):
            family_login_attempts.fail(email)
            raise InvalidData("E-mail ou senha inválidos.")

        family_login_attempts.reset(email)
        return family_account.to_dict()
