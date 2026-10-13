from datetime import date, datetime
from werkzeug.security import generate_password_hash
from models.family_account_model import FamilyAccountModel
from repositories.family_account_repository import FamilyAccountRepository
from services.profile.create_profile_admin_service import AdminProfileCreationService
from exceptions import InvalidData

MINIMUM_RESPONSIBLE_AGE = 18

class FamilyAccountCreationService:
    def __init__(self, connection):
        self.connection = connection
        self.admin_profile_service = AdminProfileCreationService(connection)
        self.family_account_repo = FamilyAccountRepository(connection)

    @staticmethod
    def calculate_age(birth_date: date) -> int:
        today = date.today()
        age = today.year - birth_date.year
        had_birthday_this_year = (today.month, today.day) >= (birth_date.month, birth_date.day)
        if not had_birthday_this_year:
            age -= 1
        return age

    def create_family_account(self, data: dict):
        required_fields = ["name", "email", "password", "birthDate"]
        for field in required_fields:
            if not data.get(field):
                raise InvalidData(f"O campo '{field}' é obrigatório.")

        birth_date = data["birthDate"]
        if isinstance(birth_date, str):
            birth_date = datetime.strptime(birth_date, "%Y-%m-%d").date()

        age = self.calculate_age(birth_date)
        if age < MINIMUM_RESPONSIBLE_AGE:
            raise InvalidData("Você precisa ter 18 anos ou mais para se cadastrar.")

        password_hash = generate_password_hash(data["password"])

        family_account = FamilyAccountModel(
            name=data["name"],
            email=data["email"],
            birth_date=birth_date,
            password_hash=password_hash,
        )

        try:
            family_account.id = self.family_account_repo.create(family_account.to_insertion())

            # fazer o create by dps
            admin_profile = self.admin_profile_service.create_admin(
                family_account.id, data["name"], data["email"]
            )

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return admin_profile, family_account.to_dict()