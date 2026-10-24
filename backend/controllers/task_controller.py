
from flask import Blueprint, jsonify, request, session, g
from services.task.create_task_service import CreateTaskService
from services.task.update_task_status_service import UpdateTaskStatusService
from services.task.list_tasks_by_child_service import ListTasksByChildService
from services.task.get_task_service import FindTaskService
from utils.proof import is_valid_extension, save_proof, remove_proof
from utils.auth import responsible_required, child_required, profile_required
from services.task.list_task_service import GetTaskService
from services.task.list_family_tasks_service import ListTaskService
from services.task.delete_task_service import DeleteTaskService
from services.task.update_task_service import UpdateTaskService, TaskNotFoundError
from exceptions import InvalidData

task_bp = Blueprint('tarefas', __name__, url_prefix='/tarefas')

@task_bp.get('/listar')
@profile_required
def list_tasks():
    connection = g.connection 

    status = request.args.get("status")
    period = request.args.get("period")
    child_profile_id = request.args.get("child_profile_id", type=int)
    page = request.args.get("page", default=1, type=int)
    size = request.args.get("size", default=6, type=int)

    task_service = ListTaskService(connection)
    result = task_service.execute(
        family_account_id=session["family_account_id"],
        profile_id=session["profile_id"],
        profile_type=session["profile_type"],
        status=status, period=period, child_profile_id=child_profile_id,
        page=page, size=size,
    )

    return jsonify(result), 200   # {"tasks": [...], "total": N}

@task_bp.get('/', defaults={'task_id': None}, strict_slashes=False)
@task_bp.get('/<int:task_id>')
@profile_required
def get_task(task_id):
    connection = g.connection

    task_service = GetTaskService(connection)
    tasks = task_service.execute(
        family_account_id=session["family_account_id"],
        profile_id=session["profile_id"],
        task_id=task_id,
        type_=request.args.get("type"),
        page=request.args.get("page", default=1, type=int),
        size=request.args.get("size", default=6, type=int),
    )

    return jsonify(tasks), 200

@task_bp.get('/crianca')
@profile_required
def get_task_child():
    connection = g.connection

    task_service = ListTasksByChildService(connection) 
    tasks = task_service.execute(
        family_account_id=session.get('family_account_id'),
        profile_id=session.get('profile_id'),
        profile_type=session.get('profile_type'),
        child_profile_id=request.args.get("child_profile_id", type=int),     
        task_assignment_id=request.args.get("task_assignment_id", type=int),
    )
    return jsonify({"tasks": tasks}), 200


@task_bp.get('/listar/<int:task_id>')
@profile_required
def listTask(task_id):
    connection = g.connection 

    family_account_id = session.get("family_account_id")

    task_service = FindTaskService(connection)
    task = task_service.execute(task_id, family_account_id)

    return jsonify({"tasks": task}), 200


@task_bp.post('/criar')
@responsible_required
def create():

    data = request.get_json() or {}
    if not data:
        raise InvalidData("Envie os dados da tareda")

    connection = g.connection

    service_task = CreateTaskService(connection)
    task = service_task.execute(
      data=data,
      family_account_id=session.get("family_account_id"),
      profile_id=session.get("profile_id")
    )

    return jsonify(task), 201

@task_bp.patch('/<int:task_id>/editar')
@responsible_required
def update(task_id):
    data = request.get_json(silent=True) or {}
    if not data:
        raise InvalidData("Envie os dados que deseja alterar.")

    service = UpdateTaskService(g.connection)
    try:
        task = service.execute(
            task_id=task_id,
            data=data,
            family_account_id=session["family_account_id"],
        )
    except TaskNotFoundError as e:
        return jsonify({"erro": str(e)}), 404

    return jsonify({"tasks": task}), 200

@task_bp.delete('/<int:task_id>/deletar')
@responsible_required
def delete(task_id):

    connection = g.connection
    task_service = DeleteTaskService(connection)
    try:
        task_service.execute(task_id)
    except ValueError as e:
        return jsonify({"erro": str(e)}), 404

    return "", 204


@task_bp.post('/<int:id>/comprovacao')
@child_required
def enviar_comprovacao(id):
    arquivo = request.files.get("foto_comprovacao")
    conexao = g.connection
    caminho_foto = None

    if arquivo and arquivo.filename:
        if not is_valid_extension(arquivo.filename):
            raise InvalidData("O arquivo precisa ser uma imagem (png, jpg, jpeg, gif ou webp).")
        caminho_foto = save_proof(arquivo)

    try:
        service = UpdateTaskStatusService(conexao)
        tarefa = service.execute(
            assignment_id=id,
            new_status="awaiting_approval",   
            profile_id=session["profile_id"],
            profile_type=session["profile_type"],
            family_account_id=session["family_account_id"],
            proof_photo=caminho_foto,
        )
        return jsonify(tarefa), 200
    except Exception:
        if caminho_foto:
            remove_proof(caminho_foto)
        raise


@task_bp.post('/<int:id>/aprovar')
@responsible_required
def aprovar(id):
    service = UpdateTaskStatusService(g.connection)
    tarefa = service.execute(
        assignment_id=id, new_status="done",
        profile_id=session["profile_id"], profile_type=session["profile_type"],
        family_account_id=session["family_account_id"],
    )
    return jsonify(tarefa), 200


@task_bp.post('/<int:id>/reprovar')
@responsible_required
def reprovar(id):
    service = UpdateTaskStatusService(g.connection)
    tarefa = service.execute(
        assignment_id=id, new_status="pending",
        profile_id=session["profile_id"], profile_type=session["profile_type"],
        family_account_id=session["family_account_id"],
    )
    return jsonify(tarefa), 200