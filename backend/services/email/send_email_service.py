import logging
import os
import smtplib
import threading
from email.message import EmailMessage

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465
SMTP_TIMEOUT = 10


class SendEmailService:
    """Integração com o serviço externo de e-mail (SMTP do Gmail).

    É o único lugar que fala com o SMTP. Usuário e senha de app vêm do .env
    (MAIL_USER e MAIL_APP_PASSWORD). Sem eles, o envio é ignorado e o sistema
    continua funcionando.

    O envio roda numa thread separada para a requisição não esperar o SMTP.
    """

    def execute(self, recipients, subject: str, body: str) -> bool:
        recipients = [email for email in (recipients or []) if email]
        if not recipients:
            return False

        user = os.environ.get("MAIL_USER")
        password = os.environ.get("MAIL_APP_PASSWORD")
        if not user or not password:
            logger.warning("E-mail não configurado no .env; envio ignorado.")
            return False

        sender = f"{os.environ.get('MAIL_FROM_NAME', 'GUP')} <{user}>"
        threading.Thread(
            target=self._send_all,
            args=(user, password, sender, recipients, subject, body),
            daemon=True,
        ).start()
        return True

    @staticmethod
    def _send_all(user, password, sender, recipients, subject, body):
        try:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as smtp:
                smtp.login(user, password)
                for recipient in recipients:
                    message = EmailMessage()
                    message["From"] = sender
                    message["To"] = recipient
                    message["Subject"] = subject
                    message.set_content(body)
                    smtp.send_message(message)
        except Exception:
            logger.exception("Falha ao enviar e-mail")
