
from models.giraffe_model import GiraffeDetailModel
from models.giraffe_model import GiraffeImageItemModel
from repositories.base_repository import BaseRepository

UPDATABLE_FIELDS = ("color_id", "background_id", "accessory_id")
ITEM_SOURCES = {
    "color": {
        "table": "giraffe_colors",
        "columns": "id, name, image_url, required_level",
        "model": GiraffeImageItemModel,
    },
    "background": {
        "table": "giraffe_backgrounds",
        "columns": "id, name, image_url, required_level",
        "model": GiraffeImageItemModel,
    },
    "accessory": {
        "table": "giraffe_accessories",
        "columns": "id, name, image_url, required_level",
        "model": GiraffeImageItemModel,
    },
}


class GiraffeRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="giraffes", model=GiraffeDetailModel)

    def find_by_child_profile(self, child_profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT g.id, g.child_profile_id, g.color_id, g.background_id, g.accessory_id,
                    c.name AS color_name, c.image_url AS color_image_url,
                    b.name AS background_name, b.image_url AS background_image_url,
                    a.name AS accessory_name, a.image_url AS accessory_image_url
                FROM giraffes AS g
                JOIN giraffe_colors AS c ON c.id = g.color_id
                JOIN giraffe_backgrounds AS b ON b.id = g.background_id
                LEFT JOIN giraffe_accessories AS a ON a.id = g.accessory_id
                WHERE g.child_profile_id = %s
            """, (child_profile_id,))
            row = cursor.fetchone()
            return GiraffeDetailModel(**row) if row else None
        finally:
            cursor.close()

    def update_by_child_profile(self, child_profile_id, changes):
        fields = [field for field in changes if field in UPDATABLE_FIELDS]
        if not fields:
            return

        set_clause = ", ".join(f"{field} = %s" for field in fields)
        params = [changes[field] for field in fields] + [child_profile_id]

        cursor = self.connection.cursor()
        try:
            cursor.execute(
                f"UPDATE giraffes SET {set_clause} WHERE child_profile_id = %s",
                params,
            )
        finally:
            cursor.close()

    def find_child_level(self, child_profile_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT l.level
                FROM profiles AS p
                JOIN levels AS l ON l.id = p.level_id
                WHERE p.id = %s
            """, (child_profile_id,))
            row = cursor.fetchone()
            return row["level"] if row else None
        finally:
            cursor.close()

class GiraffeItemRepository:
    def __init__(self, connection):
        self.connection = connection

    def find_by_id(self, item_type, item_id):
        source = ITEM_SOURCES[item_type]

        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                f"SELECT {source['columns']} FROM {source['table']} WHERE id = %s",
                (item_id,),
            )
            row = cursor.fetchone()
            return source["model"](**row) if row else None
        finally:
            cursor.close()

    def find_all(self, item_type):
        source = ITEM_SOURCES[item_type]   

        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                f"SELECT {source['columns']} FROM {source['table']} "
                "ORDER BY required_level ASC, id ASC"
            )
            return [source["model"](**row) for row in cursor.fetchall()]
        finally:
            cursor.close()