from werkzeug.security import check_password_hash
from exceptions import InvalidData, NotFound
from repositories.profile_repository import ProfileRepository

class ProfileLoginService:
    def __init__(self, connection):
        self.profile_repo = ProfileRepository(connection)
 
    def select_profile(self, family_account_id: int, profile_id: int, pin=None) -> dict:

        profile = self.profile_repo.find_by_id_and_family(profile_id, family_account_id)
        if profile is None:
            raise NotFound("Perfil não encontrado.")
 
        if profile.has_pin():
            if not pin:
                raise InvalidData("Este perfil exige PIN.")
            if not check_password_hash(profile.pin_hash, str(pin)):
                raise InvalidData("PIN incorreto.")
 
        return profile.to_dict()
 