import math

from repositories.child_repository import ChildRepository
from repositories.redemption_repository import RedemptionRepository
from exceptions import InvalidData, NotFound

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 50


class ListRedemptionsByChildService:
    """Resgates de uma criança, paginados.

    A criança só vê os próprios. O responsável escolhe a criança
    (sem escolha, vê a primeira da família).
    """

    def __init__(self, connection):
        self.child_repo = ChildRepository(connection)
        self.redemption_repo = RedemptionRepository(connection)

    def execute(self, profile_id: int, family_account_id: int, profile_type: str,
                child_id=None, page=1, size=None) -> dict:
        page = page or 1
        if page < 1:
            raise InvalidData("A página deve ser um número positivo.")
        size = min(max(size or DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)

        children = self.child_repo.list_by_family(family_account_id)
        if not children:
            raise NotFound("Nenhuma criança cadastrada nesta família.")
        allowed_ids = {child.id for child in children}

        if profile_type == "child":
            child_id = profile_id
        elif child_id is None:
            child_id = children[0].id

        if child_id not in allowed_ids:
            raise NotFound("Criança não encontrada nesta família.")

        redemptions = self.redemption_repo.list_by_child(child_id, size, (page - 1) * size)
        total = self.redemption_repo.count_by_child(child_id)

        return {
            "dados": [r.to_dict() for r in redemptions],
            "total": total,
            "pagina_atual": page,
            "total_paginas": math.ceil(total / size) or 1,
            "is_responsible": profile_type == "responsible",
        }
