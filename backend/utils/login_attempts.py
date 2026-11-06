import time
from threading import Lock

from exceptions import Forbidden


class LoginAttempts:
    """Conta as tentativas erradas (senha ou PIN) e bloqueia a chave por um tempo.

    Fica em memória: zera quando o servidor reinicia. Basta para travar tentativa
    e erro pelo navegador.
    """

    def __init__(self, max_failures=5, block_seconds=15 * 60):
        self.max_failures = max_failures
        self.block_seconds = block_seconds
        self._failures = {}
        self._lock = Lock()

    def check(self, key):
        now = time.monotonic()
        with self._lock:
            recent = [t for t in self._failures.get(key, []) if now - t < self.block_seconds]
            self._failures[key] = recent
        if len(recent) >= self.max_failures:
            raise Forbidden("Muitas tentativas erradas. Aguarde alguns minutos e tente de novo.")

    def fail(self, key):
        with self._lock:
            self._failures.setdefault(key, []).append(time.monotonic())

    def reset(self, key):
        with self._lock:
            self._failures.pop(key, None)


family_login_attempts = LoginAttempts()
profile_pin_attempts = LoginAttempts()
