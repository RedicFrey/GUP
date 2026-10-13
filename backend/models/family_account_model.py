
class FamilyAccountModel:
    def __init__(self, name, email, password_hash, birth_date, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.birth_date = birth_date
        self.password_hash = password_hash
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "email": self.email,
            "password_hash": self.password_hash,
            "birth_date": self.birth_date,
        }
