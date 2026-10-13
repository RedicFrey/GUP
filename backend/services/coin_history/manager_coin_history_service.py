from repositories.child_repository import ChildRepository
from services.coin_history.create_coin_history_service import CoinHistoryCreationService
from exceptions import InvalidData, NotFound

class CoinManagerService:
    def __init__(self, connection):
        self.connection = connection
        self.child_repo = ChildRepository(connection)
        self.history_service = CoinHistoryCreationService(connection)

    def execute(self, family_account_id: int, child_profile_id: int, amount: int, reason: str) -> dict:
        child = self.child_repo.find_by_id(child_profile_id)
        if not child:
            raise NotFound("Criança não encontrada.")

        if child.family_account_id != family_account_id:
            raise InvalidData("Essa criança não pertence à sua família.")

        try:
            amount = int(amount)
        except (TypeError, ValueError):
            raise InvalidData("O valor deve ser um número inteiro.")

        if amount == 0:
            raise InvalidData("Informe um valor diferente de zero.")

        if not reason or not reason.strip():
            raise InvalidData("Informe o motivo do ajuste.")

        new_balance = child.coins + amount
        if new_balance < 0:
            raise InvalidData("Esse ajuste deixaria o saldo da criança negativo.")

        amount_type = "credit" if amount >= 0 else "debit"

        try:
            self.child_repo.update(child.id, {"coins": new_balance})
            self.history_service.execute(
                child_profile_id=child.id,
                source="manual_adjustment",
                amount_type=amount_type,
                amount=abs(amount), 
                name=f"Ajuste manual: {reason.strip()}",
            )
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

        return self.child_repo.find_by_id(child.id).to_dict()