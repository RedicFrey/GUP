
from repositories.profile_repository import ProfileRepository
from repositories.family_account_repository import FamilyAccountRepository
from exceptions import NotFound, InvalidData


class DeleteProfileService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)
        self.family_repo = FamilyAccountRepository(connection)

    def delete(self, profil_target_id: int, family_account_id: int, me_id: int, is_admin: bool) -> bool:
        if not is_admin:
            raise InvalidData("Somente admin pode deletar perfis")
        
        if profil_target_id == me_id:
            raise InvalidData("Você é o dono da conta, então não foi possível deletar")
        
        profile = self.profile_repo.find_by_id(profil_target_id)
        family_account = self.family_repo.find_by_id(family_account_id)
        
        if profile.family_account_id != family_account.id:
            raise InvalidData("Você não está nessa conta família")
        
        if not profile:
            raise NotFound("Perfil não encontrado, então pode ser deletado.")
        
        if profile.role == "admin":
            raise InvalidData("Não é possível excluir o dono da conta")
        
        try:
            self.profile_repo.delete(profil_target_id)
            self.connection.commit()

        except Exception:
            self.connection.rollback()
            raise

        return True