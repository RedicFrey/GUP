from models import db
from models.profile_model import ProfileModel
from models.child_model import ChildProfile
from models.responsible_model import ResponsibleProfile
from models.giraffe_model import GiraffeModel
from repositories.notification_preference_repository import NotificationPreferenceRepository
from services.email.send_email_service import SendEmailService
from exceptions import Forbidden, InvalidData, NotFound
from utils.validators import validate_text

PROFILE_TYPE_LABEL = {"child": "criança", "responsible": "responsável"}


class CreateProfileService:
    """Cria um perfil na conta família.

    Qualquer responsável cria criança; só o admin cria outro responsável.
    Criança nova já ganha nível 1 e a girafa padrão.
    """

    def __init__(self, connection):
        self.connection = connection
        self.preference_repo = NotificationPreferenceRepository(connection)
        self.email_service = SendEmailService()

    def execute(self, family_account_id: int, creator_id: int, data: dict) -> dict:
        if not data:
            raise InvalidData("Envie os dados do perfil.")

        creator = ProfileModel.buscar_por_id_e_familia(creator_id, family_account_id)
        if not isinstance(creator, ResponsibleProfile):
            raise NotFound("Perfil não encontrado.")

        name = validate_text(data.get("name"), "Nome", max_length=ProfileModel.MAX_NAME_LENGTH)

        profile_type = data.get("profileType")
        if profile_type not in PROFILE_TYPE_LABEL:
            raise InvalidData("Tipo de perfil inválido.")
        if profile_type == "responsible" and not creator.is_admin():
            raise Forbidden("Apenas o administrador pode criar outro perfil responsável.")

        if profile_type == "child":
            profile = ChildProfile(
                family_account_id=family_account_id,
                name=name,
                created_by=creator.id,
                level_id=ChildProfile.DEFAULT_LEVEL_ID,
                seen_level=ChildProfile.DEFAULT_SEEN_LEVEL,
            )
            profile.salvar()
            GiraffeModel(child_profile_id=profile.id).salvar()
        else:
            profile = ResponsibleProfile(
                family_account_id=family_account_id,
                name=name,
                created_by=creator.id,
            )
            profile.salvar()
            self.preference_repo.create_defaults(profile.id)

        db.session.commit()

        self._notify_responsibles(profile, creator)
        return profile.to_dict()

    def _notify_responsibles(self, new_profile, creator):
        """Avisa os outros responsáveis (e o admin) que um perfil foi criado."""
        profile_info = f'"{new_profile.name}" ({PROFILE_TYPE_LABEL[new_profile.profile_type]})'
        family = ProfileModel.listar_por_familia(new_profile.family_account_id)

        for responsible in family:
            if not isinstance(responsible, ResponsibleProfile) or responsible.id == new_profile.id:
                continue
            if responsible.id == creator.id:
                if not responsible.is_admin():
                    continue
                text = f"Você criou o perfil {profile_info} na sua conta família."
            else:
                text = f"{creator.name} criou o perfil {profile_info} na sua conta família."

            self.email_service.execute([responsible.notification_email], "GUP: novo perfil criado", text)
