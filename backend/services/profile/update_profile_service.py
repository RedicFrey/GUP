from repositories.profile_repository import ProfileRepository
from werkzeug.security import generate_password_hash
from exceptions import InvalidData

class ProfileUpdatedService:
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

        pin = dados_dict.get("pin")
        if pin and pin.strip():
            dados_atualizar["pin_hash"] = generate_password_hash(pin)

        if not dados_atualizar:
            raise InvalidData("Nenhum dado válido para atualizar")

        print(dados_dict)

        try:
            self.profile_repo.update(id, dados_atualizar)
            # usuario_atualizado = self.profile_repo.find_by_id(id)
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            raise InvalidData("Não foi possível atualizar") from e

        return True