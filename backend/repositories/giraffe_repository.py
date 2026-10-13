from repositories.base_repository import BaseRepository
from models.giraffe.giraffe_model import GiraffeModel

class GiraffeRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="giraffes", model=GiraffeModel)