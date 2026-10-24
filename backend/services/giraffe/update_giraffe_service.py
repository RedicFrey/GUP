
from repositories.giraffe_repository import GiraffeRepository
from repositories.giraffe_repository import GiraffeItemRepository
from exceptions import InvalidData, NotFound

# campo do corpo -> tipo de item
FIELD_TO_ITEM_TYPE = {
    "color_id": "color",
    "background_id": "background",
    "accessory_id": "accessory",
}


class UpdateGiraffeService:
    def __init__(self, connection):
        self.connection = connection
        self.giraffe_repo = GiraffeRepository(connection)
        self.item_repo = GiraffeItemRepository(connection)

    def execute(self, profile_id: int, data: dict) -> dict:
        data = data or {}

        # "in" e não data.get(): accessory_id: null significa "tirar o acessório"
        changes = {field: data[field] for field in FIELD_TO_ITEM_TYPE if field in data}

        if not changes:
            raise InvalidData("Envie o que deseja alterar: color_id, background_id ou accessory_id.")

        if not self.giraffe_repo.find_by_child_profile(profile_id):
            raise NotFound("Girafa não encontrada para este perfil.")

        level = self.giraffe_repo.find_child_level(profile_id) or 0

        # valida tudo antes de gravar
        for field, value in changes.items():
            if value is None:
                if field != "accessory_id":
                    raise InvalidData("Cor e fundo são obrigatórios, só o acessório pode ser removido.")
                continue

            if not isinstance(value, int) or isinstance(value, bool):
                raise InvalidData(f"Valor inválido em {field}.")

            item = self.item_repo.find_by_id(FIELD_TO_ITEM_TYPE[field], value)
            if not item:
                raise InvalidData(f"Item não encontrado em {field}.")

            if item.required_level > level:
                raise InvalidData(f"Item bloqueado: exige nível {item.required_level}.")

        try:
            self.giraffe_repo.update_by_child_profile(profile_id, changes)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return self.giraffe_repo.find_by_child_profile(profile_id).to_dict()