
NOTIFICATION_TYPES = ("task_submitted", "reward_redeemed", "event_created")
NOTIFICATION_TYPE_KEYS = {
    "task_submitted": "tasks",
    "reward_redeemed": "redemptions",
    "event_created": "events",
}

class NotificationPreferenceModel:
    def __init__(self, id, profile_id, type, enabled):
        self.id = id
        self.profile_id = profile_id
        self.type = type
        self.enabled = bool(enabled)   

    def to_dict(self):
        return {"type": self.type, "enabled": self.enabled}

    def to_insertion(self):
        return {
            "type": self.type, 
            "enabled": self.enabled,
            "profile_id": self.profile_id,
        }
