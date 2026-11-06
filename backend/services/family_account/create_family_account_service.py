from datetime import date

from werkzeug.security import generate_password_hash

from models import db
from models.family_account_model import FamilyAccountModel
from models.profile_model import ProfileModel
from models.responsible_model import ResponsibleProfile
from repositories.family_account_repository import FamilyAccountRepository
from repositories.notification_preference_repository import NotificationPreferenceRepository
from services.email.send_email_service import SendEmailService
from exceptions import InvalidData
from utils.dates import parse_date, today_local
from utils.validators import validate_email, validate_text

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 64
MINIMUM_AGE = 18
MAX_AGE = 120


class CreateFamilyAccountService:
    """Cadastra a conta família e já cria o perfil responsável administrador."""

    def __init__(self, connection):
        self.connection = connection
        self.family_account_repo = FamilyAccountRepository(connection)
        self.preference_repo = NotificationPreferenceRepository(connection)
        self.email_service = SendEmailService()

    def execute(self, data: dict) -> dict:
        for field in ("name", "email", "password", "birthDate"):
            if not data.get(field):
                raise InvalidData(f"O campo '{field}' é obrigatório.")

        name = validate_text(
            data["name"], "Nome",
            min_length=FamilyAccountModel.MIN_NAME_LENGTH,
            max_length=FamilyAccountModel.MAX_NAME_LENGTH,
        )
        email = validate_email(data["email"])
        if self.family_account_repo.find_by_email(email):
            raise InvalidData("Já existe uma conta cadastrada com esse e-mail.")

        password = self._validate_password(data["password"])
        birth_date = self._validate_birth_date(data["birthDate"])

        family_account = FamilyAccountModel(
            name=name,
            email=email,
            birth_date=birth_date,
            password_hash=generate_password_hash(password),
        )
        family_account.salvar()

        first_name = name.split()[0][:ProfileModel.MAX_NAME_LENGTH]
        admin = ResponsibleProfile(
            family_account_id=family_account.id,
            name=first_name,
            notification_email=email,
            role=ProfileModel.ADMIN,
        )
        admin.salvar()
        admin.atualizar(created_by=admin.id)
        self.preference_repo.create_defaults(admin.id)

        db.session.commit()

        self.email_service.execute(
            [email],
            "Bem-vindo ao GUP!",
            f"Olá, {first_name}! Sua conta família foi criada com sucesso.\n\n"
            "Agora é só criar os perfis das crianças e cadastrar as primeiras tarefas.",
        )

        return {"profile_admin": admin.to_dict(), "family_account": family_account.to_dict()}

    @staticmethod
    def _validate_password(password) -> str:
        if not isinstance(password, str):
            raise InvalidData("Senha inválida.")
        if not MIN_PASSWORD_LENGTH <= len(password) <= MAX_PASSWORD_LENGTH:
            raise InvalidData(
                f"A senha deve ter entre {MIN_PASSWORD_LENGTH} e {MAX_PASSWORD_LENGTH} caracteres."
            )
        return password

    @classmethod
    def _validate_birth_date(cls, value) -> date:
        birth_date = parse_date(value, "Data de nascimento")
        today = today_local()

        if birth_date > today:
            raise InvalidData("A data de nascimento não pode estar no futuro.")

        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age < MINIMUM_AGE:
            raise InvalidData("Você precisa ter 18 anos ou mais para se cadastrar.")
        if age > MAX_AGE:
            raise InvalidData("Informe uma data de nascimento válida.")

        return birth_date
