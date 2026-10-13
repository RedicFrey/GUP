from exceptions import InvalidData, NotFound
from repositories.family_account_repository import FamilyAccountRepository
from services.profile.create_profile_service import ProfileCreationService
from services.profile.update_profile_service import ProfileUpdatedService


class FamilyAccountRegistrationService:
    def __init__(self, connection):
        self.family_repo = FamilyAccountRepository(connection)
        self.profile_service = ProfileCreationService(connection)
        self.upt_profile_service = ProfileUpdatedService(connection)
        self.connection = connection

    def execute(self, family_account_id: int, profiles_list: list, created_by: int,
        is_admin: bool = False, profile_admin=None, ) -> dict:

        family_account = self.family_repo.find_by_id(family_account_id)
        if not family_account:
            raise NotFound("Conta família não encontrada.")

        if not isinstance(profiles_list, list):
            raise InvalidData("A lista de perfis é inválida.")

        for profile in profiles_list:
            if profile.get("profileType") == "responsible" and not profile.get("notificationEmail"):
                raise InvalidData("Responsável precisa de e-mail.")

        try:
            profiles = [
                self.profile_service.create_profile_without_commit(
                    family_account_id, profile, created_by, is_admin,
                ).to_dict()
                for profile in profiles_list
            ]

            if profile_admin is not None:
                profile_id = profile_admin.get("id")
                if not profile_id:
                    raise InvalidData("Não foi possível identificar o perfil")
                self.upt_profile_service.execute(profile_id, profile_admin)

            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return {"membros": profiles}