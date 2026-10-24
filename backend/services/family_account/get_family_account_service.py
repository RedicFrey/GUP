
from repositories.family_account_repository import FamilyAccountRepository
from repositories.profile_repository import ProfileRepository
from exceptions import NotFound


class GetFamilyAccountService:
    def __init__(self, connection):
        self.family_account_repo = FamilyAccountRepository(connection)
        self.profile_repo = ProfileRepository(connection)

    def execute(self, family_account_id: int) -> dict:
        family_account = self.family_account_repo.find_by_id(family_account_id)
        if not family_account:
            raise NotFound("Conta família não encontrada para ser apresentada")

        profiles = self.profile_repo.list_by_account(family_account_id)

        info = {}
        if profiles:
            info["profiles"] = [p.to_dict() for p in profiles]

        return info

        