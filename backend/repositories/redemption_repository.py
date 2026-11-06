from models.redemption_model import RedemptionModel
from repositories.base_repository import BaseRepository


class RedemptionRepository(BaseRepository):
    """Resgates de uma criança (paginados) e busca de resgate pela família."""

    def list_by_child(self, child_profile_id, limit, offset):
        return self._buscar_modelos(RedemptionModel, """
            SELECT * FROM redemptions
            WHERE child_profile_id = :child_profile_id
            ORDER BY created_at DESC, id DESC
            LIMIT :limit OFFSET :offset
        """, {"child_profile_id": child_profile_id, "limit": limit, "offset": offset})

    def count_by_child(self, child_profile_id):
        return self._buscar_valor(
            "SELECT COUNT(*) AS total FROM redemptions WHERE child_profile_id = :child_profile_id",
            {"child_profile_id": child_profile_id},
        )

    def find_by_id_and_family(self, redemption_id, family_account_id):
        """O resgate não tem family_account_id: a família vem pelo perfil da criança."""
        return self._buscar_modelo(RedemptionModel, """
            SELECT r.*
            FROM redemptions AS r
            JOIN profiles AS p ON p.id = r.child_profile_id
            WHERE r.id = :redemption_id AND p.family_account_id = :family_account_id
        """, {"redemption_id": redemption_id, "family_account_id": family_account_id})
