
class GiraffeModel:
    def __init__(self, profile_id, color_id, background_id, id=None,
                 accessory_id=None, created_at=None, updated_at=None):
        self.id = id
        self.profile_id = profile_id
        self.color_id = color_id
        self.accessory_id = accessory_id
        self.background_id = background_id
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "profile_id": self.profile_id,
            "color_id": self.color_id,
            "accessory_id": self.accessory_id,
            "background_id": self.background_id,
        }

    def to_insertion(self):
        return {
            "profile_id": self.profile_id,
            "color_id": self.color_id,
            "accessory_id": self.accessory_id,
            "background_id": self.background_id,
        }

GIRAFFE_ITEM_TYPES = ("color", "background", "accessory")


class GiraffeDetailModel:
    """Girafa de um perfil, já com os dados de cor, fundo e acessório."""
    def __init__(self, id, child_profile_id, color_id, background_id, accessory_id=None,
                 color_name=None, color_image_url=None,
                 background_name=None, background_image_url=None,
                 accessory_name=None, accessory_image_url=None):
        self.id = id
        self.child_profile_id = child_profile_id
        self.color_id = color_id
        self.background_id = background_id
        self.accessory_id = accessory_id
        self.color_name = color_name
        self.color_image_url = color_image_url
        self.background_name = background_name
        self.background_image_url = background_image_url
        self.accessory_name = accessory_name
        self.accessory_image_url = accessory_image_url

    def to_dict(self):
        return {
            "id": self.id,
            "child_profile_id": self.child_profile_id,
            "color": {
                "id": self.color_id,
                "name": self.color_name,
                "image_url": self.color_image_url,
            },
            "background": {
                "id": self.background_id,
                "name": self.background_name,
                "image_url": self.background_image_url,
            },
            # o acessório é opcional (accessory_id aceita NULL)
            "accessory": None if self.accessory_id is None else {
                "id": self.accessory_id,
                "name": self.accessory_name,
                "image_url": self.accessory_image_url,
            },
        }


class GiraffeColorModel:
    def __init__(self, id, primary_color, secondary_color, required_level):
        self.id = id
        self.primary_color = primary_color
        self.secondary_color = secondary_color
        self.required_level = required_level

    def to_dict(self):
        return {
            "id": self.id,
            "primary_color": self.primary_color,
            "secondary_color": self.secondary_color,
            "required_level": self.required_level,
        }


class GiraffeImageItemModel:
    def __init__(self, id, name, image_url, required_level):
        self.id = id
        self.name = name
        self.image_url = image_url
        self.required_level = required_level

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
            "required_level": self.required_level,
        }