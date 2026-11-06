from models.child_model import ChildProfile
from repositories.base_repository import BaseRepository


class ChildRepository(BaseRepository):
    """Consultas especiais sobre perfis de criança."""

    def list_by_family(self, family_account_id):
        return self._buscar_modelos(ChildProfile, """
            SELECT * FROM profiles
            WHERE family_account_id = :family_account_id AND profile_type = 'child'
            ORDER BY name ASC, id ASC
        """, {"family_account_id": family_account_id})

    def find_for_update(self, child_profile_id, family_account_id):
        """Busca a criança da família e trava a linha até o commit (saldo e XP)."""
        return self._buscar_modelo(ChildProfile, """
            SELECT * FROM profiles
            WHERE id = :child_profile_id
              AND family_account_id = :family_account_id
              AND profile_type = 'child'
        """ + self._for_update, {
            "child_profile_id": child_profile_id,
            "family_account_id": family_account_id,
        })

    def find_ids_in_family(self, family_account_id, child_ids):
        """Dos ids pedidos, devolve só os que são crianças dessa família."""
        if not child_ids:
            return set()

        rows = self._buscar_varios("""
            SELECT id FROM profiles
            WHERE family_account_id = :family_account_id
              AND profile_type = 'child'
              AND id IN :child_ids
        """, {"family_account_id": family_account_id, "child_ids": list(child_ids)},
            listas=("child_ids",))
        return {row["id"] for row in rows}
