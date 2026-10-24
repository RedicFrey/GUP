
from werkzeug.security import generate_password_hash

from repositories.profile_repository import ProfileRepository
from exceptions import InvalidData


class UpdateProfileService:
    def __init__(self, connection):
        self.connection = connection
        self.profile_repo = ProfileRepository(connection)

    def execute(self, id, dados_dict):
        if not isinstance(dados_dict, dict):
            raise TypeError(f"Esperado um dict em 'dados_dict', recebido {type(dados_dict).__name__}")

        dados_atualizar = {}

        if dados_dict.get("name"):
            dados_atualizar["name"] = dados_dict["name"]

        if dados_dict.get("notification_email"):
            dados_atualizar["notification_email"] = dados_dict["notification_email"]

        if dados_dict.get("level_id"):
            dados_atualizar["level_id"] = dados_dict["level_id"]

        if dados_dict.get("seen_level"):
            dados_atualizar["seen_level"] = dados_dict["seen_level"]

        remove_pin = "pin" in dados_dict and dados_dict["pin"] is None

        pin = dados_dict.get("pin")
        if pin is not None and not isinstance(pin, str):
            raise InvalidData("Pin inválido.")
        if pin and pin.strip():
            dados_atualizar["pin_hash"] = generate_password_hash(pin)

        if not dados_atualizar and not remove_pin:
            raise InvalidData("Nenhum dado válido para atualizar")

        try:
            if dados_atualizar:
                self.profile_repo.update(id, dados_atualizar)
            if remove_pin:
                self.profile_repo.clear_pin(id)
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            raise InvalidData("Não foi possível atualizar") from e

        print(dados_dict)

        try:
            self.profile_repo.update(id, dados_atualizar)
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            raise InvalidData("Não foi possível atualizar") from e

        return True