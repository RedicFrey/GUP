from controllers.base_controller import BaseController
from utils.auth import responsible_required, child_required, profile_required
from services.task.list_tasks_service import ListTasksService
from services.task.list_tasks_with_children_service import ListTasksWithChildrenService
from services.task.get_task_service import GetTaskService
from services.task.get_child_task_service import GetChildTaskService
from services.task.create_task_service import CreateTaskService
from services.task.update_task_service import UpdateTaskService
from services.task.delete_task_service import DeleteTaskService
from services.task.submit_task_proof_service import SubmitTaskProofService
from services.task.approve_task_service import ApproveTaskService
from services.task.reject_task_service import RejectTaskService


class TaskController(BaseController):
    """Recurso: tarefas e as tarefas de cada criança (envio, aprovação, reprovação)."""

    NAME = "tasks"
    URL_PREFIX = "/tarefas"

    def register_routes(self):
        self.route("/listar", self.listar, ["GET"], profile_required)
        self.route("/", self.listar_com_criancas, ["GET"], profile_required, strict_slashes=False)
        self.route("/<int:task_id>", self.ver, ["GET"], profile_required)
        self.route("/crianca", self.ver_da_crianca, ["GET"], profile_required)
        self.route("/criar", self.criar, ["POST"], responsible_required)
        self.route("/<int:task_id>/editar", self.editar, ["PATCH"], responsible_required)
        self.route("/<int:task_id>/deletar", self.excluir, ["DELETE"], responsible_required)
        self.route("/<int:assignment_id>/comprovacao", self.enviar_comprovacao, ["POST"], child_required)
        self.route("/<int:assignment_id>/aprovar", self.aprovar, ["POST"], responsible_required)
        self.route("/<int:assignment_id>/reprovar", self.reprovar, ["POST"], responsible_required)

    def listar(self):
        result = ListTasksService(self.connection).execute(
            family_account_id=self.family_account_id,
            profile_id=self.profile_id,
            profile_type=self.profile_type,
            status=self.parametro("status"),
            period=self.parametro("period"),
            child_profile_id=self.parametro("child_profile_id", int),
            page=self.parametro("page", int, 1),
            size=self.parametro("size", int, 6),
        )
        return self.responder(result)

    def listar_com_criancas(self):
        result = ListTasksWithChildrenService(self.connection).execute(
            family_account_id=self.family_account_id,
            type_=self.parametro("type"),
            page=self.parametro("page", int, 1),
            size=self.parametro("size", int, 6),
        )
        return self.responder(result)

    def ver(self, task_id):
        return self.responder(GetTaskService(self.connection).execute(task_id, self.family_account_id))

    def ver_da_crianca(self):
        task = GetChildTaskService(self.connection).execute(
            family_account_id=self.family_account_id,
            profile_id=self.profile_id,
            profile_type=self.profile_type,
            child_profile_id=self.parametro("child_profile_id", int),
            task_assignment_id=self.parametro("task_assignment_id", int),
        )
        return self.responder({"tasks": task})

    def criar(self):
        task = CreateTaskService(self.connection).execute(
            family_account_id=self.family_account_id,
            profile_id=self.profile_id,
            data=self.dados_json(),
        )
        return self.responder(task, 201)

    def editar(self, task_id):
        task = UpdateTaskService(self.connection).execute(task_id, self.family_account_id, self.dados_json())
        return self.responder({"tasks": task})

    def excluir(self, task_id):
        DeleteTaskService(self.connection).execute(task_id, self.family_account_id)
        return self.sem_conteudo()

    def enviar_comprovacao(self, assignment_id):
        task = SubmitTaskProofService(self.connection).execute(
            assignment_id=assignment_id,
            profile_id=self.profile_id,
            family_account_id=self.family_account_id,
            photo=self.arquivo("foto_comprovacao"),
        )
        return self.responder(task)

    def aprovar(self, assignment_id):
        return self.responder(ApproveTaskService(self.connection).execute(assignment_id, self.family_account_id))

    def reprovar(self, assignment_id):
        return self.responder(RejectTaskService(self.connection).execute(assignment_id, self.family_account_id))
