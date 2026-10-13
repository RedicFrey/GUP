# Inutilizado # Inutilizado # Inutilizado # Inutilizado
# Inutilizado # Inutilizado # Inutilizado # Inutilizado
# Inutilizado # Inutilizado # Inutilizado # Inutilizado
# Inutilizado # Inutilizado # Inutilizado # Inutilizado

class TaskMessageModel:
    def __init__(self, sender_id, recipient_id, id=None,
                 created_at=None, updated_at=None):
        self.id = id
        self.sender_id = sender_id
        self.recipient_id = recipient_id
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
        }

    def to_insertion(self):
        return {
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
        }
