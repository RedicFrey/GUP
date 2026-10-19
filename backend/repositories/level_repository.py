

class LevelRepository:
    def __init__(self, connection):
        self.connection = connection

    # 1. Nível que o XP já alcançou (usa o xp_required)
    def find_level_for_xp(self, xp):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT id, level, xp_required
                FROM levels
                WHERE xp_required <= %s
                ORDER BY xp_required DESC
                LIMIT 1
            """, (xp,))
            return cursor.fetchone()
        finally:
            cursor.close()

    # 3. Itens que ficaram disponíveis entre o nível antigo (exclusivo) e o novo (inclusivo)
    def find_items_unlocked(self, old_level, new_level):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT 'color' AS type, id, NULL AS name, NULL AS image_url,
                       primary_color, secondary_color, required_level
                FROM giraffe_colors
                WHERE required_level > %s AND required_level <= %s
                UNION ALL
                SELECT 'background', id, name, image_url, NULL, NULL, required_level
                FROM giraffe_backgrounds
                WHERE required_level > %s AND required_level <= %s
                UNION ALL
                SELECT 'accessory', id, name, image_url, NULL, NULL, required_level
                FROM giraffe_accessories
                WHERE required_level > %s AND required_level <= %s
                ORDER BY required_level ASC, type ASC, id ASC
            """, (old_level, new_level) * 3)
            return cursor.fetchall()
        finally:
            cursor.close()

    # 4. Atualiza o nível da criança
    def update_level(self, profile_id, level_id):
        cursor = self.connection.cursor()
        try:
            cursor.execute(
                "UPDATE profiles SET level_id = %s WHERE id = %s",
                (level_id, profile_id),
            )
        finally:
            cursor.close()

    # 5. Nível atual, próximo nível (por SELECT, não por +1) e XP
    def find_progress(self, profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT p.xp,
                       cur.level       AS level,
                       cur.xp_required AS level_xp,
                       nxt.level       AS next_level,
                       nxt.xp_required AS next_level_xp
                FROM profiles AS p
                LEFT JOIN levels AS cur ON cur.id = p.level_id
                LEFT JOIN levels AS nxt ON nxt.id = (
                    SELECT n.id
                    FROM levels AS n
                    WHERE n.level > COALESCE(cur.level, 0)
                    ORDER BY n.level ASC
                    LIMIT 1
                )
                WHERE p.id = %s
            """, (profile_id,))
            return cursor.fetchone()
        finally:
            cursor.close()

    # apoio da função 2: soma o XP direto no banco (atômico)
    def increase_xp(self, profile_id, amount):
        cursor = self.connection.cursor()
        try:
            cursor.execute(
                "UPDATE profiles SET xp = xp + %s WHERE id = %s",
                (amount, profile_id),
            )
        finally:
            cursor.close()

    def find_level_seen_state(self, profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT p.seen_level, COALESCE(l.level, 0) AS level
                FROM profiles AS p
                LEFT JOIN levels AS l ON l.id = p.level_id
                WHERE p.id = %s
            """, (profile_id,))
            return cursor.fetchone()
        finally:
            cursor.close()

    def update_seen_level(self, profile_id, level):
        cursor = self.connection.cursor()
        try:
            cursor.execute(
                "UPDATE profiles SET seen_level = %s WHERE id = %s",
                (level, profile_id),
            )
        finally:
            cursor.close()
