from models import db
from models.redemption_model import RedemptionModel
from repositories.redemption_repository import RedemptionRepository
from exceptions import InvalidData, NotFound

MESSAGES = {
    RedemptionModel.DONE: "Recompensa marcada como entregue",
    RedemptionModel.PENDING: "Recompensa marcada como pendente",
}


class UpdateRedemptionStatusService:
    """O responsável marca um resgate da família como entregue (done) ou volta para pendente."""

    def __init__(self, connection):
        self.connection = connection
        self.redemption_repo = RedemptionRepository(connection)

    def execute(self, family_account_id: int, data: dict) -> dict:
        redemption_id = data.get("id")
        status = data.get("status")

        if not isinstance(redemption_id, int) or isinstance(redemption_id, bool):
            raise InvalidData("Informe o resgate que será atualizado.")
        if status not in RedemptionModel.STATUSES:
            raise InvalidData("Status inválido. Use 'pending' ou 'done'.")

        redemption = self.redemption_repo.find_by_id_and_family(redemption_id, family_account_id)
        if redemption is None:
            raise NotFound("Resgate não encontrado.")

        if redemption.status != status:
            redemption.atualizar(status=status)
            db.session.commit()

        return {"message": MESSAGES[status], "status": status}
