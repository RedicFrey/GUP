from datetime import date
from repositories.task_assignment_repository import TaskAssignmentRepository
from repositories.child_repository import ChildRepository
from exceptions import NotFound, InvalidData


class MonthlyReportService:
    def __init__(self, connection):
        self.task_repo = TaskAssignmentRepository(connection)
        self.child_repo = ChildRepository(connection)

    def execute(self, family_account_id, profile_id, profile_type,
                child_profile_id=None, month=None) -> dict:

        start, end = self._month_range(month)

        # Criança só vê o próprio relatório, ignora o id recebido
        if profile_type != "responsible":
            child_profile_id = profile_id

        if child_profile_id is None:
            raise InvalidData("Informe a criança.")

        child = self.child_repo.find_by_id(child_profile_id)
        if not child or child.family_account_id != family_account_id:
            raise NotFound("Criança não encontrada.")

        row = self.task_repo.monthly_report(family_account_id, child_profile_id, start, end)

        total = int(row["total"])
        done_total = int(row["done_total"])
        done_late = int(row["done_late"])
        not_done = int(row["not_done"])

        return {
            "child": {"id": child.id, "name": child.name},
            "month": start.strftime("%Y-%m"),
            "total": total,
            "done": done_total - done_late,     # feitas no prazo
            "done_late": done_late,             # feitas com atraso
            "not_done": not_done,               # venceram e continuam pendentes
            "open": total - done_total - not_done,  # ainda dentro do prazo ou aguardando aprovação
        }

    @staticmethod
    def _month_range(month):
        if month is None:
            today = date.today()
            year, mon = today.year, today.month
        else:
            try:
                year, mon = (int(p) for p in month.split("-"))
                date(year, mon, 1)
            except ValueError:
                raise InvalidData("Mês inválido. Use o formato AAAA-MM.")

        start = date(year, mon, 1)
        end = date(year + 1, 1, 1) if mon == 12 else date(year, mon + 1, 1)
        return start, end