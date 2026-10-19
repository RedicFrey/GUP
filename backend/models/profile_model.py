
class ProfileModel:
    ADMIN = "admin"

    BASE_FIELDS = {
        "id", "family_account_id", "name", "role",
        "notification_email", "pin_hash",
        "created_at", "updated_at", "created_by"
    }
    CHILD_FIELDS = {"coins", "xp", "level_id", "seen_level", "goal_id", "strikes"}

    def __init__(self, family_account_id, name, profile_type, role=None, id=None,
                 notification_email=None, pin_hash=None,
                 created_at=None, updated_at=None, created_by=None):
        self.id = id
        self.family_account_id = family_account_id
        self.name = name
        self.profile_type = profile_type
        self.notification_email = notification_email
        self.pin_hash = pin_hash
        self.role = role
        self.created_by = created_by
        self.created_at = created_at
        self.updated_at = updated_at

    def has_pin(self):
        return self.pin_hash is not None

    def is_admin(self):
        return self.role == self.ADMIN

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "profile_type": self.profile_type,
            "has_pin": self.has_pin(),
            "created_by": self.created_by,
            "role": self.role,
        }

    def to_insertion(self):
        return {
            "family_account_id": self.family_account_id,
            "name": self.name,
            "profile_type": self.profile_type,
            "notification_email": self.notification_email,
            "pin_hash": self.pin_hash,
            "created_by": self.created_by,
            "role": self.role
        }

    @classmethod
    def from_row(cls, row: dict):
        from models.child_model import ChildProfile
        from models.responsible_model import ResponsibleProfile
    
        row = dict(row)
        profile_type = row.pop("profile_type", None)
    
        base_kwargs = {k: v for k, v in row.items() if k in cls.BASE_FIELDS}
    
        if profile_type == "child":
            child_kwargs = {k: v for k, v in row.items() if k in cls.CHILD_FIELDS}
            return ChildProfile(**base_kwargs, **child_kwargs)
    
        if profile_type == "responsible":
            return ResponsibleProfile(**base_kwargs)
    
        return cls(profile_type=profile_type, **base_kwargs)