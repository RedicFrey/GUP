
from repositories.giraffe_repository import GiraffeRepository
from exceptions import NotFound

class GetChildGiraffeService:
    def __init__(self, connection):
        self.connection = connection
        self.giraffe_repo = GiraffeRepository(connection)

    def execute(self, profile_id: int) -> dict:
        giraffe = self.giraffe_repo.find_by_child_profile(profile_id)
        if not giraffe:
            raise NotFound("Girafa não encontrada para este perfil.")

        return giraffe.to_dict()
