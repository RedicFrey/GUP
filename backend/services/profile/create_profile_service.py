
from repositories.profile_repository import ProfileRepository
from repositories.giraffe_repository import GiraffeRepository   
from repositories.family_account_repository import FamilyAccountRepository
from services.profile.update_profile_service import UpdateProfileService
from models.profile_model import ProfileModel                
from exceptions import InvalidData, NotFound
from services.notification.create_notification_preferences_service import CreateNotificationPreferencesService

MAX_NAME_LENGTH = 20
MIN_NAME_LENGTH = 1
DEFAULT_GIRAFFE_COLOR_ID = 1
DEFAULT_GIRAFFE_BACKGROUND_ID = 1
DEFAULT_GIRAFFE_ACCESSORY_ID = 1

 
class CreateProfileService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)
        self.profile_upt_repo = UpdateProfileService(connection)
        self.giraffe_repo = GiraffeRepository(connection)
        self.notification_service = CreateNotificationPreferencesService(connection) 
        self.family_repo = FamilyAccountRepository(connection)
 
    def create_profile(self, family_account_id: int, profile_id: int, data: dict, created_by: int, is_admin: bool = False) -> dict:

        data = data or {}

        family = self.family_repo.find_by_id(family_account_id)
        profile = self.profile_repo.find_by_id(profile_id)
        
        if not family:
            raise NotFound("Conta família não encontrada")
        if family.id != profile.family_account_id:
            raise InvalidData("Você não é dessa família para criar um perfil")

        name = data.get("name")
        if not isinstance(name, str):
            raise InvalidData("Nome inválido.")
        name = name.strip()
        if not MIN_NAME_LENGTH <= len(name) <= MAX_NAME_LENGTH:
            raise InvalidData(f"O nome deve ter de {MIN_NAME_LENGTH} a {MAX_NAME_LENGTH} caracteres.")

        profile_type = data.get("profileType")
        if profile_type not in ("child", "responsible"):
            raise InvalidData(f"Tipo de perfil inválido: {profile_type}")

        if profile_type == "responsible" and not is_admin:
            raise InvalidData("Apenas um responsável admin pode criar outro perfil responsável.")

        profile = ProfileModel(
            id=None,
            name=name,
            profile_type=profile_type,
            family_account_id=family_account_id,
            created_by=created_by,
        )

        try:
            profile.id = self.profile_repo.create(profile.to_insertion())

            if profile_type == "child":
                self.profile_upt_repo.execute(profile.id, {
                    "level_id": 1,
                    "seen_level": 1,
                })
                self.giraffe_repo.create({"child_profile_id": profile.id})
            else:
                self.notification_service.execute(profile.id, enabled=False)

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return profile.to_dict()
    
