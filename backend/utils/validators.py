import re

from exceptions import InvalidData

EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$"
)
PIN_PATTERN = re.compile(r"^\d{4,8}$")
MAX_AMOUNT = 1_000
MAX_EMAIL_LENGTH = 100


def validate_text(value, field, max_length, min_length=1, required=True):
    """Texto com espaços aparados. Devolve None quando é opcional e veio vazio."""
    if value is None and not required:
        return None
    if not isinstance(value, str):
        raise InvalidData(f"{field} inválido.")

    value = value.strip()
    if not value:
        if required:
            raise InvalidData(f"{field} é obrigatório.")
        return None

    if not min_length <= len(value) <= max_length:
        if min_length > 1:
            raise InvalidData(f"{field} deve ter de {min_length} a {max_length} caracteres.")
        raise InvalidData(f"{field} deve ter no máximo {max_length} caracteres.")
    return value


def validate_positive_int(value, field="Valor", allow_zero=False, maximum=MAX_AMOUNT) -> int:
    if isinstance(value, bool):
        raise InvalidData(f"{field} inválido.")

    if isinstance(value, str):
        value = value.strip()
        if not (value.isascii() and value.isdigit()):
            raise InvalidData(f"{field} deve conter apenas números.")
        value = int(value)

    if not isinstance(value, int):
        raise InvalidData(f"{field} deve ser um número inteiro.")

    minimum = 0 if allow_zero else 1
    if value < minimum:
        raise InvalidData(f"{field} deve ser {'maior ou igual a 0' if allow_zero else 'maior que 0'}.")

    if value > maximum:
        raise InvalidData(f"{field} não pode passar de {maximum}.")

    return value


def validate_id_list(value, field="Lista de crianças"):
    """Lista de ids (o front manda strings) -> conjunto de inteiros, sem repetição."""
    if not isinstance(value, list) or not value:
        raise InvalidData("Selecione ao menos uma criança.")
    try:
        return {int(v) for v in value}
    except (TypeError, ValueError):
        raise InvalidData(f"{field} inválida.")


def validate_email(email) -> str:
    if not isinstance(email, str):
        raise InvalidData("E-mail inválido.")

    email = email.strip().lower()

    if len(email) > MAX_EMAIL_LENGTH or not EMAIL_PATTERN.match(email):
        raise InvalidData("Informe um e-mail válido.")

    return email


def validate_pin(pin) -> str:
    if not isinstance(pin, str) or not PIN_PATTERN.match(pin.strip()):
        raise InvalidData("O PIN deve ter de 4 a 8 números.")
    return pin.strip()
