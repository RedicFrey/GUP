
from models.profile_model import ProfileModel

class ResponsibleProfile(ProfileModel):
    def __init__(self, **kwargs):
        super().__init__(**kwargs, profile_type="responsible")

    def to_dict(self):
        return {
            **super().to_dict(),
            "role": self.role,
        }

    def to_insertion(self):
        return {
            **super().to_insertion(),
            "role": self.role,
        }

    def create_task(self, data):
        ...