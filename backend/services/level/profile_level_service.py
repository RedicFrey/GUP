from repositories.level_repository import LevelRepository
from exceptions import InvalidData, NotFound

class ProfileLevelService():
    def __init__(self, connection):
        self.connection = connection
        self.level_repo = LevelRepository(connection)

    # 2. Soma o XP, confere se bateu a meta e, se sim, sobe de nível
    def add_xp(self, profile_id: int, amount: int) -> dict:
        if not isinstance(amount, int) or isinstance(amount, bool) or amount <= 0:
            raise InvalidData("A quantidade de XP deve ser um número inteiro positivo.")

        self.level_repo.increase_xp(profile_id, amount)

        # lê depois de somar: traz o XP já atualizado e o nível ainda antigo
        state = self.level_repo.find_progress(profile_id)
        if not state:
            raise NotFound("Perfil não encontrado.")

        old_level = state["level"] or 0
        reached = self.level_repo.find_level_for_xp(state["xp"])

        leveled_up = reached is not None and reached["level"] > old_level
        unlocked_items = []

        if leveled_up:
            self.level_repo.update_level(profile_id, reached["id"])                          # 4
            unlocked_items = self.level_repo.find_items_unlocked(old_level, reached["level"])  # 3

        return {
            "xp": state["xp"],
            "leveled_up": leveled_up,
            "old_level": old_level,
            "new_level": reached["level"] if leveled_up else old_level,
            "unlocked_items": unlocked_items,
        }

    # 5. Dados para a barra de progresso
    def get_progress(self, profile_id: int) -> dict:
        progress = self.level_repo.find_progress(profile_id)
        if not progress:
            raise NotFound("Perfil não encontrado.")
        return progress

    def get_pending_level_up(self, profile_id: int) -> dict:
        state = self.level_repo.find_level_seen_state(profile_id)
        if not state:
            raise NotFound("Perfil não encontrado.")

        seen, current = state["seen_level"], state["level"]

        if current <= seen:
            return {"pending": False}

        return {
            "pending": True,
            "from_level": seen,
            "to_level": current,
            "unlocked_items": self.level_repo.find_items_unlocked(seen, current),
        }

    def acknowledge_level_up(self, profile_id: int, level) -> dict:
        if not isinstance(level, int) or isinstance(level, bool):
            raise InvalidData("Informe o nível que foi visto.")

        state = self.level_repo.find_level_seen_state(profile_id)
        if not state:
            raise NotFound("Perfil não encontrado.")

        # nunca marca acima do nível atual, e nunca volta para trás
        new_seen = min(level, state["level"])

        if new_seen > state["seen_level"]:
            try:
                self.level_repo.update_seen_level(profile_id, new_seen)
                self.connection.commit()
            except Exception:
                self.connection.rollback()
                raise

        return {"ok": True}