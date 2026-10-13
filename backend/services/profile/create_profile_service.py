from repositories.profile_repository import ProfileRepository
from repositories.giraffe_repository import GiraffeRepository   
from models.profile_model import ProfileModel                
from exceptions import InvalidData
from services.notification.create_notification_preferences_service import NotificationPreferencesCreateService

DEFAULT_GIRAFFE_COLOR_ID = 1
DEFAULT_GIRAFFE_BACKGROUND_ID = 1
DEFAULT_GIRAFFE_ACCESSORY_ID = 1
 
class ProfileCreationService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)
        self.giraffe_repo = GiraffeRepository(connection)
        self.notification_service = NotificationPreferencesCreateService(connection) 
 
    def _build_and_insert(self, family_account_id: int, data: dict, created_by: int, is_admin: bool) -> ProfileModel:
        data = data or {}
        name = (data.get("name") or "").strip()
        profile_type = data.get("profileType")
 
        if not name:
            raise InvalidData("O campo nome é obrigatório.")
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
 
        profile.id = self.profile_repo.create(profile.to_insertion())
 
        if profile_type == "child":
            self.giraffe_repo.create({
                "child_profile_id": profile.id,
                "color_id": DEFAULT_GIRAFFE_COLOR_ID,
                "background_id": DEFAULT_GIRAFFE_BACKGROUND_ID,
                "accessory_id": DEFAULT_GIRAFFE_ACCESSORY_ID,
            })
        else:
            self.notification_service.execute(profile.id, enabled=False)
 
        return profile
 
    def create_profile(self, family_account_id: int, data: dict, created_by: int, is_admin: bool = False) -> dict:
        try:
            profile = self._build_and_insert(
                family_account_id=family_account_id,
                data=data,
                created_by=created_by,
                is_admin=is_admin,
            )
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
        return profile.to_dict()
    
