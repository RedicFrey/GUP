
class Resgate:
    def __init__(self, nome, custo, crianca_id, recompensa_id, id=None,
                 data_criacao=None, data_atualizacao=None, status=None):
        self.id = id
        self.crianca_id = crianca_id
        self.nome = nome
        self.custo = custo
        self.recompensa_id = recompensa_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao
        self.status = status

    def to_dict(self):
        return {
            "id": self.id,
            "crianca_id": self.crianca_id,
            "recompensa_id": self.recompensa_id,
            "status": self.status,
            "data_criacao": self.data_criacao,
            "nome": self.nome,
            "custo": self.custo
        }

    def para_insercao(self):
        return {
            "nome": self.nome,
            "custo": self.custo,
            "crianca_id": self.crianca_id,
            "recompensa_id": self.recompensa_id
        }