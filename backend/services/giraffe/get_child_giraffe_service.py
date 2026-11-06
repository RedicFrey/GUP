from repositories.giraffe_repository import GiraffeRepository
from exceptions import NotFound


class GetChildGiraffeService:
    """Girafa da criança logada, com cor, fundo e acessório."""

    def __init__(self, connection):
        self.giraffe_repo = GiraffeRepository(connection)

    def execute(self, profile_id: int) -> dict:
        giraffe = self.giraffe_repo.find_by_child(profile_id)
        if giraffe is None:
            raise NotFound("Girafa não encontrada para este perfil.")
        return giraffe.to_dict()
