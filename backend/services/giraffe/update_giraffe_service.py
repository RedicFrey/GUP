from models import db
from models.giraffe_model import GiraffeModel
from models.giraffe_item_model import GIRAFFE_ITEM_MODELS
from repositories.giraffe_repository import GiraffeRepository
from repositories.level_repository import LevelRepository
from exceptions import InvalidData, NotFound


class UpdateGiraffeService:
    """A criança troca cor, fundo ou acessório, só entre os itens já liberados pelo nível."""

    def __init__(self, connection):
        self.connection = connection
        self.giraffe_repo = GiraffeRepository(connection)
        self.level_repo = LevelRepository(connection)

    def execute(self, profile_id: int, data: dict) -> dict:
        # "in" e não data.get(): accessory_id: null significa "tirar o acessório"
        changes = {field: data[field] for field in GiraffeModel.ITEM_FIELDS if field in data}
        if not changes:
            raise InvalidData("Envie o que deseja alterar: color_id, background_id ou accessory_id.")

        giraffe = self.giraffe_repo.find_by_child(profile_id)
        if giraffe is None:
            raise NotFound("Girafa não encontrada para este perfil.")

        level = self.level_repo.find_child_level(profile_id)

        # valida tudo antes de gravar
        for field, value in changes.items():
            if value is None:
                if field not in GiraffeModel.OPTIONAL_FIELDS:
                    raise InvalidData("Cor e fundo são obrigatórios; só o acessório pode ser removido.")
                continue

            if not isinstance(value, int) or isinstance(value, bool):
                raise InvalidData(f"Valor inválido em {field}.")

            item = GIRAFFE_ITEM_MODELS[GiraffeModel.ITEM_FIELDS[field]].buscar_por_id(value)
            if item is None:
                raise NotFound(f"Item não encontrado em {field}.")
            if not item.is_unlocked_for(level):
                raise InvalidData(f"Item bloqueado: exige nível {item.required_level}.")

        giraffe.atualizar(**changes)
        db.session.commit()

        return self.giraffe_repo.find_by_child(profile_id).to_dict()
