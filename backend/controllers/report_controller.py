from controllers.base_controller import BaseController
from utils.auth import profile_required
from services.report.get_child_monthly_report_service import GetChildMonthlyReportService


class ReportController(BaseController):
    """Recurso: relatório mensal de tarefas por criança."""

    NAME = "reports"
    URL_PREFIX = "/relatorios"

    def register_routes(self):
        self.route("", self.mensal, ["GET"], profile_required, strict_slashes=False)

    def mensal(self):
        report = GetChildMonthlyReportService(self.connection).execute(
            family_account_id=self.family_account_id,
            profile_id=self.profile_id,
            profile_type=self.profile_type,
            child_profile_id=self.parametro("child_profile_id", int),
            month=self.parametro("month"),
        )
        return self.responder(report)
