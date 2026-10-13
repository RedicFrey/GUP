from flask import Blueprint, request, jsonify, session, g
from services.reward.create_reward_service import RewardCreationService
from services.reward.buy_reward_service import RewardBoughtService
from services.reward.choose_goal_service import GoalSetService
from utils.auth import profile_required, responsible_required, child_required
from services.reward.list_family_rewards_service import RewardsByFamilyFamiliaService
from services.child.list_child_service import ChildListService
from services.reward.delete_reward_service import DeleteRewardService

reward_bp = Blueprint("recompensas", __name__, url_prefix="/recompensas")

@reward_bp.get('/')
@profile_required
def list():

    connection = g.connection

    family_account_id = session.get("family_account_id")
    profile_id = session.get("profile_id")
    profile_type = session.get("profile_type")

    auth_child = None
    if profile_type == 'child':
        service_child = ChildListService(connection)
        child = service_child.list(profile_id)
        auth_child = child.to_dict() if child else None

    service_reward = RewardsByFamilyFamiliaService(connection)
    rewards = service_reward.list(family_account_id)

    return jsonify({
        "rewards": rewards,
        "auth_child": auth_child,
        "profile_type": profile_type,
    }), 200


@reward_bp.post('/criar')
@responsible_required
def create():

    family_account_id = session.get("family_account_id")

    data = request.get_json() or {}

    connection = g.connection
    

    service_reward = RewardCreationService(connection)
    reward =  service_reward.execute(family_account_id, data)
    return jsonify({"reward": reward}), 201


@reward_bp.post('/comprar/<int:id>')
@child_required
def buy(id):
    connection = g.connection

    service_child = RewardBoughtService(connection)
    child = service_child.execute(session.get('profile_id'), id)
    return jsonify(child), 200


@reward_bp.post('/definir-meta/<int:id>')
@child_required
def goal(id):

    connection = g.connection

    service_child = GoalSetService(connection)
    child = service_child.execute(session.get('profile_id'), id)

    return jsonify(child), 200

@reward_bp.delete('/deletar/<int:reward_id>')
@responsible_required
def delete(reward_id):

    family_account_id = session.get("family_account_id")
    connection = g.connection

    service_reward = DeleteRewardService(connection)
    reward =  service_reward.execute(reward_id, family_account_id)
    return jsonify({"reward": "Recompensa deletada com sucesso"}), 201
