
from datetime import date, datetime

from werkzeug.security import generate_password_hash

from models.family_account_model import FamilyAccountModel
from repositories.family_account_repository import FamilyAccountRepository
from services.profile.create_admin_profile_service import CreateAdminProfileService
from exceptions import InvalidData
from utils.validators import validate_email

MAX_NAME_LENGTH = 50
MIN_NAME_LENGTH = 8
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 64
MINIMUM_AGE = 18
MAX_AGE = 120
MAX_PROFILE_NAME_LENGTH = 20


class CreateFamilyAccountService:
    def __init__(self, connection):
        self.connection = connection
        self.admin_profile_service = CreateAdminProfileService(connection)
        self.family_account_repo = FamilyAccountRepository(connection)

    def execute(self, data: dict) -> tuple:
        required_fields = ["name", "email", "password", "birthDate"]
        for field in required_fields:
            if not data.get(field):
                raise InvalidData(f"O campo '{field}' é obrigatório.")

        name = data["name"]
        if not isinstance(name, str):
            raise InvalidData("Nome inválido.")
        name = name.strip()
        if not MIN_NAME_LENGTH <= len(name) <= MAX_NAME_LENGTH:
            raise InvalidData(
                f"Informe seu nome completo, com {MIN_NAME_LENGTH} a {MAX_NAME_LENGTH} caracteres."
            )

        email = validate_email(data["email"])
        if self.family_account_repo.find_by_email(email):
            raise InvalidData("Já existe uma conta cadastrada com esse e-mail.")

        password = self.validate_password(data["password"])

        birth_date = data["birthDate"]
        if isinstance(birth_date, str):
            try:
                birth_date = datetime.strptime(birth_date, "%Y-%m-%d").date()
            except ValueError:
                raise InvalidData("Data de nascimento inválida.")

        if birth_date > date.today():
            raise InvalidData("A data de nascimento não pode estar no futuro.")

        age = self.calculate_age(birth_date)
        if age < MINIMUM_AGE:
            raise InvalidData("Você precisa ter 18 anos ou mais para se cadastrar.")

        if age > MAX_AGE:
            raise InvalidData("Informe uma data de nascimento válida.")

        password_hash = generate_password_hash(password)

        family_account = FamilyAccountModel(
            name=name,
            email=email,
            birth_date=birth_date,
            password_hash=password_hash,
        )

        try:
            family_account.id = self.family_account_repo.create(
                family_account.to_insertion()
            )

            # fazer o create by dps
            first_name = name.split()[0][:MAX_PROFILE_NAME_LENGTH]
            admin_profile = self.admin_profile_service.create_admin(
                family_account.id, first_name, email
            )

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return admin_profile, family_account.to_dict()

    @staticmethod
    def calculate_age(birth_date: date) -> int:
        today = date.today()
        age = today.year - birth_date.year
        had_birthday_this_year = (today.month, today.day) >= (
            birth_date.month,
            birth_date.day,
        )
        if not had_birthday_this_year:
            age -= 1
        return age

    @staticmethod
    def validate_password(password) -> str:
        if not isinstance(password, str):
            raise InvalidData("Senha inválida.")
        if not MIN_PASSWORD_LENGTH <= len(password) <= MAX_PASSWORD_LENGTH:
            raise InvalidData(
                f"A senha deve ter entre {MIN_PASSWORD_LENGTH} e {MAX_PASSWORD_LENGTH} caracteres."
            )
        return password
