
from flask import Blueprint, jsonify, request, session, g
from utils.auth import responsible_required
from services.notification.list_notification_preferences_service import ListNotificationPreferencesService
from services.notification.update_notification_preferences_service import UpdateNotificationPreferencesService

notification_bp = Blueprint('notificacoes', __name__, url_prefix='/notificacoes')

@notification_bp.get('/permitidas')
@responsible_required
def list_notifications():
    connection = g.connection
    profile_id = session.get("profile_id")

    notification_service = ListNotificationPreferencesService(connection)
    result = notification_service.execute(profile_id=profile_id)

    return jsonify(result), 200


@notification_bp.put('/permitidas/atualizar')
@responsible_required
def update_notifications():
    connection = g.connection
    data = request.get_json() or {}
    profile_id = session.get("profile_id")

    notification_service = UpdateNotificationPreferencesService(connection)
    notification = notification_service.execute(profile_id=profile_id, data=data)

    return jsonify({"notification": notification}), 200


@notification_bp.post('/enviar')
@responsible_required
def submit_notification():

    # TODO: implementar o envio

    return jsonify({"erro": "Não implementado."}), 501