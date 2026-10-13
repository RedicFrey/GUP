from repositories.profile_repository import ProfileRepository
from exceptions import NotFound

class DeleteProfileService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)

    def delete(self, profile_id: int) -> True:
        profile = self.profile_repo.find_by_id(profile_id)
        if not profile:
            raise NotFound("Perfil não encontrado, então pode ser deletado.")
        
        try:
            self.profile_repo.delete(profile_id)
            self.connection.commit()

        except Exception:
            self.connection.rollback()
            raise

        return True