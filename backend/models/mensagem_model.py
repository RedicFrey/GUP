
class MensagemTarefa:
    def __init__(self, remetente_id, destinatario_id, id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.remetente_id = remetente_id
        self.destinatario_id = destinatario_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "remetente_id": self.remetente_id,
            "destinatario_id": self.destinatario_id,
        }

    def para_insercao(self):
        return {
            "remetente_id": self.remetente_id,
            "destinatario_id": self.destinatario_id,
        }