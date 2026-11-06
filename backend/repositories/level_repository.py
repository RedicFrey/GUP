from models.level_model import LevelModel
from repositories.base_repository import BaseRepository


class LevelRepository(BaseRepository):
    """Consultas de nível: nível pelo XP, itens liberados e barra de progresso."""

    def find_level_for_xp(self, xp):
        """Maior nível cujo XP mínimo já foi alcançado."""
        return self._buscar_modelo(LevelModel, """
            SELECT * FROM levels
            WHERE xp_required <= :xp
            ORDER BY xp_required DESC
            LIMIT 1
        """, {"xp": xp})

    def find_child_level(self, child_profile_id):
        """Número do nível atual da criança (0 se ainda não tem nível)."""
        level = self._buscar_valor("""
            SELECT COALESCE(l.level, 0) AS level
            FROM profiles AS p
            LEFT JOIN levels AS l ON l.id = p.level_id
            WHERE p.id = :child_profile_id
        """, {"child_profile_id": child_profile_id})
        return level if level is not None else 0

    def find_progress(self, child_profile_id):
        return self._buscar_um("""
            SELECT p.xp,
                   COALESCE(cur.level, 0)       AS level,
                   COALESCE(cur.xp_required, 0) AS level_xp,
                   nxt.level                    AS next_level,
                   nxt.xp_required              AS next_level_xp
            FROM profiles AS p
            LEFT JOIN levels AS cur ON cur.id = p.level_id
            LEFT JOIN levels AS nxt ON nxt.id = (
                SELECT n.id
                FROM levels AS n
                WHERE n.level > COALESCE(cur.level, 0)
                ORDER BY n.level ASC
                LIMIT 1
            )
            WHERE p.id = :child_profile_id AND p.profile_type = 'child'
        """, {"child_profile_id": child_profile_id})

    def find_items_unlocked(self, old_level, new_level):
        """Itens da girafa liberados entre dois níveis (old_level < required <= new_level)."""
        return self._buscar_varios("""
            SELECT 'color' AS type, id, name, image_url, required_level
            FROM giraffe_colors
            WHERE required_level > :old_level AND required_level <= :new_level

            UNION ALL

            SELECT 'background', id, name, image_url, required_level
            FROM giraffe_backgrounds
            WHERE required_level > :old_level AND required_level <= :new_level

            UNION ALL

            SELECT 'accessory', id, name, image_url, required_level
            FROM giraffe_accessories
            WHERE required_level > :old_level AND required_level <= :new_level

            ORDER BY required_level ASC, type ASC, id ASC
        """, {"old_level": old_level, "new_level": new_level})
