from repositories.family_account_repository import FamilyAccountRepository
from exceptions import NotFound

class FamilyProfileListingService:
    def __init__(self, connection):
        self.connection = connection
        self.family_account_repo = FamilyAccountRepository(connection)        

    def list(self, family_account_id: int) -> dict:
        family_account = self.family_account_repo.find_by_id(family_account_id)
        if family_account is None:
            raise NotFound("Conta família não encontrada")

        profiles = self.family_account_repo.list_family_account_members(family_account_id)
        if not profiles:
            raise NotFound("Erro ao listar perfis")

        list_dict = [profile.to_dict() for profile in profiles]

        return list_dict