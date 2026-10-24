import re
from exceptions import InvalidData

EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$"
)
MAX_AMOUNT = 1_000

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

def validate_email(email) -> str:
    if not isinstance(email, str):
        raise InvalidData("E-mail inválido.")

    email = email.strip().lower()

    if len(email) > 100 or not EMAIL_PATTERN.match(email):
        raise InvalidData("Informe um e-mail válido.")

    return email