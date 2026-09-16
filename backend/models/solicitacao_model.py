class Solicitacao:
    def __init__(self, usuario_id, conta_id, id=None, status="pendente",
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.usuario_id = usuario_id
        self.conta_id = conta_id
        self.status = status
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "conta_id": self.conta_id,
            "status": self.status,
            "data_criacao": self.data_criacao,
        }

    def para_insercao(self):
        return {
            "usuario_id": self.usuario_id,
            "conta_id": self.conta_id,
            "status": self.status,
        }