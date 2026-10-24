
from repositories.giraffe_repository import GiraffeItemRepository
from models.giraffe_model import GIRAFFE_ITEM_TYPES
from exceptions import InvalidData

class ListGiraffeItemsService:
    def __init__(self, connection):
        self.connection = connection
        self.item_repo = GiraffeItemRepository(connection)

    def execute(self, item_type: str) -> list:
        if item_type not in GIRAFFE_ITEM_TYPES:
            raise InvalidData(f"Tipo de item inválido. Use: {', '.join(GIRAFFE_ITEM_TYPES)}.")

        items = self.item_repo.find_all(item_type)
        return [item.to_dict() for item in items]