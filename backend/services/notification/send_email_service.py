
# from repositories.notification_preferences_repository import NotificationPreferenceRepository

# class NotificationService:
#     def __init__(self, connection):
#         self.repo = NotificationPreferenceRepository(connection)

#     def notify(self, type_, family_account_id, actor_id, text):
#         try:
#             recipients = self.repo.recipients_for(type_, family_account_id, actor_id)
#             for r in recipients:
#                 send_email(r["notification_email"], "GUP: novo aviso", text)
#         except Exception:
#             logger.exception("Falha ao enviar notificação")
