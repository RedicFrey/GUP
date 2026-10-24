from repositories.profile_repository import ProfileRepository
from exceptions import NotFound

class RemoveChildGoalService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)

    def execute(self, profile_id: int) -> dict:
        child = self.profile_repo.find_by_id(profile_id)
        if not child:
            raise NotFound("Criança não encontrada.")

        try:
            # None vira NULL no banco: a criança fica sem meta
            self.profile_repo.update(profile_id, {"goal_id": None})
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return self.profile_repo.find_by_id(profile_id).to_dict()