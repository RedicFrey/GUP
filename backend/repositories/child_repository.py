
from repositories.base_repository import BaseRepository
from models.child_model import ChildProfile
from exceptions import NotFound


class ChildRepository(BaseRepository):
    def __init__(self, connection):
        super().__init__(connection, table="profiles", model=ChildProfile)

    def list_family_account_children(self, family_account_id):
        cursor = self.connection.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM profiles WHERE family_account_id = %s AND profile_type = 'child'",
                (family_account_id,)
            )
            rows = cursor.fetchall()
            return [self._do_child(row) for row in rows]
        finally:
            cursor.close()

    def _do_child(self, row):
        row = dict(row)
        row.pop("profile_type", None)
        base_kwargs = {k: v for k, v in row.items() if k in ChildProfile.BASE_FIELDS}
        child_kwargs = {k: v for k, v in row.items() if k in ChildProfile.CHILD_FIELDS}
        return ChildProfile(**base_kwargs, **child_kwargs)

    def add_coins(self, child_profile_id, amount):
        cursor = self.connection.cursor()
        try:
            cursor.execute(
                "UPDATE profiles SET coins = coins + %s WHERE id = %s",
                (amount, child_profile_id),
            )
            if cursor.rowcount == 0:
                raise NotFound("Criança não encontrada para receber a recompensa.")
        finally:
            cursor.close()