from datetime import date

from models.child_model import ChildProfile
from repositories.task_assignment_repository import TaskAssignmentRepository
from exceptions import InvalidData, NotFound
from utils.dates import today_local


class GetChildMonthlyReportService:
    """Relatório do mês de uma criança: tarefas feitas no prazo, com atraso, não feitas e em aberto."""

    def __init__(self, connection):
        self.connection = connection
        self.assignment_repo = TaskAssignmentRepository(connection)

    def execute(self, family_account_id: int, profile_id: int, profile_type: str,
                child_profile_id=None, month=None) -> dict:
        start, end = self._month_range(month)

        if profile_type != "responsible":
            child_profile_id = profile_id
        if child_profile_id is None:
            raise InvalidData("Informe a criança.")

        child = ChildProfile.buscar_por_id_e_familia(child_profile_id, family_account_id)
        if child is None:
            raise NotFound("Criança não encontrada.")

        row = self.assignment_repo.monthly_report(family_account_id, child.id, start, end)
        total = int(row["total"] or 0)
        done_total = int(row["done_total"] or 0)
        done_late = int(row["done_late"] or 0)
        not_done = int(row["not_done"] or 0)

        return {
            "child": {"id": child.id, "name": child.name},
            "month": start.strftime("%Y-%m"),
            "total": total,
            "done": done_total - done_late,
            "done_late": done_late,
            "not_done": not_done,
            "open": total - done_total - not_done,
        }

    @staticmethod
    def _month_range(month):
        try:
            if month is None:
                today = today_local()
                year, mon = today.year, today.month
            else:
                year, mon = (int(part) for part in month.split("-"))
            start = date(year, mon, 1)
            end = date(year + 1, 1, 1) if mon == 12 else date(year, mon + 1, 1)
        except (ValueError, AttributeError):
            raise InvalidData("Mês inválido. Use o formato AAAA-MM.")
        return start, end
