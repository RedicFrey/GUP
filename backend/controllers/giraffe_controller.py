from controllers.base_controller import BaseController
from utils.auth import profile_required, child_required
from services.giraffe.get_child_giraffe_service import GetChildGiraffeService
from services.giraffe.list_giraffe_items_service import ListGiraffeItemsService
from services.giraffe.update_giraffe_service import UpdateGiraffeService


class GiraffeController(BaseController):
    """Recurso: girafa da criança e itens de personalização."""

    NAME = "giraffes"
    URL_PREFIX = "/girafas"

    def register_routes(self):
        self.route("/me", self.ver, ["GET"], profile_required)
        self.route("/me", self.atualizar, ["PATCH"], child_required)
        self.route("/itens/<item_type>", self.listar_itens, ["GET"], profile_required)

    def ver(self):
        return self.responder(GetChildGiraffeService(self.connection).execute(self.profile_id))

    def atualizar(self):
        giraffe = UpdateGiraffeService(self.connection).execute(self.profile_id, self.dados_json())
        return self.responder(giraffe)

    def listar_itens(self, item_type):
        return self.responder(ListGiraffeItemsService(self.connection).execute(item_type))
