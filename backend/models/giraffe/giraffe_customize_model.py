
class CatalogItemModel:
    def __init__(self, name, required_level, id=None, image_url=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.image_url = image_url
        self.required_level = required_level
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
            "required_level": self.required_level,
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "image_url": self.image_url,
            "required_level": self.required_level,
        }


class GiraffeBackground(CatalogItemModel):
    pass

class GiraffeAccessory(CatalogItemModel):
    pass