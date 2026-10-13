
class EventModel:
    def __init__(self, name, event_date, family_account_id, created_by, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.name = name
        self.event_date = event_date
        self.family_account_id = family_account_id
        self.created_by = created_by
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "event_date": str(self.event_date) if self.event_date else None,
            "family_account_id": self.family_account_id,
            "created_by": self.created_by,
        }

    def to_insertion(self):
        return {
            "name": self.name,
            "event_date": self.event_date,
            "family_account_id": self.family_account_id,
            "created_by": self.created_by,
        }
