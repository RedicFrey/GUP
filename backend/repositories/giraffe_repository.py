from models.giraffe_model import GiraffeModel
from repositories.base_repository import BaseRepository


class GiraffeRepository(BaseRepository):
    """Girafa da criança já com a cor, o fundo e o acessório.

    O join garante que a cor e o fundo existem; os itens em si chegam pelos
    relacionamentos da GiraffeModel (giraffe.color, giraffe.background, giraffe.accessory).
    """

    def find_by_child(self, child_profile_id):
        return self._buscar_modelo(GiraffeModel, """
            SELECT g.*
            FROM giraffes AS g
            JOIN giraffe_colors AS c ON c.id = g.color_id
            JOIN giraffe_backgrounds AS b ON b.id = g.background_id
            LEFT JOIN giraffe_accessories AS a ON a.id = g.accessory_id
            WHERE g.child_profile_id = :child_profile_id
        """, {"child_profile_id": child_profile_id})
