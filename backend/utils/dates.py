from datetime import datetime
from zoneinfo import ZoneInfo

from exceptions import InvalidData

# Todo horário do sistema é o de Brasília, sem fuso (o MySQL guarda DATETIME "ingênuo").
# Por isso as consultas recebem now_local() como parâmetro em vez de usar NOW()/CURDATE().
APP_TZ = ZoneInfo("America/Sao_Paulo")


def now_local() -> datetime:
    return datetime.now(APP_TZ).replace(tzinfo=None, microsecond=0)


def today_local():
    return now_local().date()


def parse_date(value, field="Data"):
    """'AAAA-MM-DD' -> date."""
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        raise InvalidData(f"{field}: formato inválido.")


def parse_datetime(value, field="Data"):
    """ISO 8601 ('AAAA-MM-DDTHH:MM', com ou sem fuso) -> datetime no horário de Brasília."""
    try:
        parsed = datetime.fromisoformat(value)
    except (TypeError, ValueError):
        raise InvalidData(f"{field}: formato inválido.")
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(APP_TZ).replace(tzinfo=None)
    return parsed
