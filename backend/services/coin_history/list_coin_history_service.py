from models.child_model import ChildProfile
from models.coin_history_model import CoinHistoryModel
from repositories.child_repository import ChildRepository
from repositories.coin_history_repository import CoinHistoryRepository
from exceptions import NotFound

MAX_PAGE_SIZE = 50


class ListCoinHistoryService:
    """Histórico de moedas de uma criança, com filtro de crédito/débito.

    A criança só vê o próprio histórico. O responsável escolhe a criança
    (sem escolha, vê a primeira da família).
    """

    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.history_repo = CoinHistoryRepository(connection)

    def execute(self, profile_id: int, family_account_id: int, profile_type: str,
                child_id=None, amount_type=None, page=1, size=None) -> dict:
        is_responsible = profile_type == "responsible"
        amount_type = amount_type if amount_type in CoinHistoryModel.AMOUNT_TYPES else None
        page = max(page or 1, 1)
        if size is not None:
            size = min(max(size, 1), MAX_PAGE_SIZE)

        children = []
        if is_responsible:
            children = [c.to_dict() for c in self.child_repo.list_by_family(family_account_id)]
            child = self._select_child(children, child_id)
        else:
            own = ChildProfile.buscar_por_id_e_familia(profile_id, family_account_id)
            if own is None:
                raise NotFound("Perfil de criança não encontrado.")
            child = own.to_dict()

        offset = (page - 1) * size if size else 0
        records = self.history_repo.list_by_child(child["id"], amount_type, limit=size, offset=offset)
        total = self.history_repo.count_by_child(child["id"], amount_type)

        return {
            "child": child,
            "children": children,
            "history": [record.to_dict() for record in records],
            "total": total,
            "page": page,
            "size": size,
            "is_responsible": is_responsible,
        }

    @staticmethod
    def _select_child(children, child_id):
        if not children:
            raise NotFound("Nenhuma criança cadastrada nesta família.")
        if child_id is None:
            return children[0]

        child = next((c for c in children if c["id"] == child_id), None)
        if child is None:
            raise NotFound("Criança não encontrada nesta família.")
        return child
