
class GiraffeColorModel:
    def __init__(self, primary_color, secondary_color, required_level, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.primary_color = primary_color
        self.secondary_color = secondary_color
        self.required_level = required_level
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "primary_color": self.primary_color,
            "secondary_color": self.secondary_color,
            "required_level": self.required_level,
        }

    def to_insertion(self):
        return {
            "primary_color": self.primary_color,
            "secondary_color": self.secondary_color,
            "required_level": self.required_level,
        }