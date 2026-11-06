from models.giraffe_item_model import GIRAFFE_ITEM_MODELS
from exceptions import InvalidData


class ListGiraffeItemsService:
    """Todos os itens de um tipo (cor, fundo ou acessório), com o nível que cada um exige."""

    def __init__(self, connection):
        self.connection = connection

    def execute(self, item_type: str) -> list:
        model = GIRAFFE_ITEM_MODELS.get(item_type)
        if model is None:
            raise InvalidData(f"Tipo de item inválido. Use: {', '.join(GIRAFFE_ITEM_MODELS)}.")
        return [item.to_dict() for item in model.listar_todos()]
