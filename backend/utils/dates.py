# utils/dates.py
from datetime import datetime
from zoneinfo import ZoneInfo
from exceptions import InvalidData

APP_TZ = ZoneInfo("America/Sao_Paulo")

def now_local() -> datetime:
    return datetime.now(APP_TZ).replace(tzinfo=None)

def today_local():
    return now_local().date()

def parse_date(value, field="data"):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        raise InvalidData(f"{field}: formato inválido.")

def parse_datetime(value, field="data"):
    try:
        parsed = datetime.fromisoformat(value)
    except (TypeError, ValueError):
        raise InvalidData(f"{field}: formato inválido.")
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(APP_TZ).replace(tzinfo=None)
    return parsed