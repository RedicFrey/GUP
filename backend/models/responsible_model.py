from .profile_model import ProfileModel


class ResponsibleProfile(ProfileModel):
    """Perfil de responsável: cria tarefas, recompensas e eventos e aprova tarefas."""

    PROFILE_TYPE = "responsible"
    __mapper_args__ = {"polymorphic_identity": PROFILE_TYPE}
