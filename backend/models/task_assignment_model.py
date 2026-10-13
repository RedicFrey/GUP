from exceptions import InvalidData

class TaskAssignmentModel:

    PENDING = "pending"
    AWAITING_APPROVAL = "awaiting_approval"
    DONE = "done"
    NOT_DONE = "not_done"

    VALID_STATUSES = {PENDING, AWAITING_APPROVAL, DONE, NOT_DONE}

    def __init__(self, task_id, child_profile_id, id=None, status=None,
                 completion_date=None, proof_photo=None,
                 coins_earned=0, xp_earned=0,
                 created_at=None, updated_at=None):
        self.id = id
        self.task_id = task_id
        self.child_profile_id = child_profile_id
        self.status = status
        self.completion_date = completion_date
        self.proof_photo = proof_photo
        self.coins_earned = coins_earned
        self.xp_earned = xp_earned
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "child_profile_id": self.child_profile_id,
            "status": self.status,
            "completion_date": (
                self.completion_date.isoformat() if self.completion_date else None
            ),
            "proof_photo": self.proof_photo,
            "coins_earned": self.coins_earned,
            "xp_earned": self.xp_earned,
        }

    def to_insertion(self):
        return {
            "task_id": self.task_id,
            "child_profile_id": self.child_profile_id,
        }

    @classmethod
    def verify_status(cls, status):
        if status not in cls.VALID_STATUSES:
            raise InvalidData(f"Status inválido: {status}")