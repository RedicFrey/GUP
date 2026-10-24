
from repositories.profile_repository import ProfileRepository
from exceptions import NotFound


class GetProfileService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)

    def get(self, profile_id: int) -> dict:
        row = self.profile_repo.find_by_id(profile_id)
        if not row:
            raise NotFound("Perfil não encontrado")

        return row.to_dict()
