from models import db
from models.profile_model import ProfileModel
from models.notification_preference_model import NotificationPreferenceModel
from models.task_assignment_model import TaskAssignmentModel
from repositories.task_assignment_repository import TaskAssignmentRepository
from services.notification.notify_responsibles_service import NotifyResponsiblesService
from exceptions import Forbidden, InvalidData, NotFound
from utils.dates import now_local
from utils.proof import save_proof, remove_proof


class SubmitTaskProofService:
    """A criança envia a tarefa para aprovação, com foto quando a tarefa exige."""

    def __init__(self, connection):
        self.connection = connection
        self.assignment_repo = TaskAssignmentRepository(connection)
        self.notify_service = NotifyResponsiblesService(connection)

    def execute(self, assignment_id: int, profile_id: int, family_account_id: int, photo=None) -> dict:
        assignment = self.assignment_repo.find_for_update(assignment_id, family_account_id)
        if assignment is None:
            raise NotFound("Tarefa não encontrada.")

        if assignment["child_profile_id"] != profile_id:
            raise Forbidden("Essa tarefa não é sua.")
        if assignment["status"] == TaskAssignmentModel.DONE:
            raise InvalidData("Esta tarefa já foi concluída.")
        if assignment["status"] == TaskAssignmentModel.AWAITING_APPROVAL:
            raise InvalidData("Esta tarefa já foi enviada para análise.")

        has_photo = bool(photo and photo.filename)
        if assignment["required_proof"] and not has_photo:
            raise InvalidData("Envie uma foto como comprovação.")

        fields = {"status": TaskAssignmentModel.AWAITING_APPROVAL, "submitted_at": now_local()}
        new_photo = save_proof(photo) if has_photo else None
        if new_photo:
            fields["proof_photo"] = new_photo

        try:
            TaskAssignmentModel.buscar_por_id(assignment["assignment_id"]).atualizar(**fields)
            db.session.commit()
        except Exception:
            remove_proof(new_photo)   # não deixa foto sem tarefa na pasta
            raise

        if new_photo and assignment["proof_photo"]:
            remove_proof(assignment["proof_photo"])   # foto do envio reprovado anterior

        child = ProfileModel.buscar_por_id(profile_id)
        self.notify_service.execute(
            NotificationPreferenceModel.TASK_SUBMITTED,
            family_account_id,
            "GUP: tarefa aguardando aprovação",
            f'{child.name if child else "Uma criança"} enviou a tarefa "{assignment["name"]}" para a sua aprovação.',
        )

        return self.assignment_repo.find_detail(assignment_id)
