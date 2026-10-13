
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