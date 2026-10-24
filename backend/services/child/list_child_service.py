
from repositories.profile_repository import ProfileRepository
from exceptions import NotFound, InvalidData


class ChildListService():
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)

    def list(self, profile_id: int) -> dict:
        child = self.profile_repo.find_by_id(profile_id)
        if not child:
            raise NotFound("Perfil não encontrado")

        if child.profile_type == "responsible":
            raise InvalidData("Perfil é de responsável e não de criança")

        return child

        
