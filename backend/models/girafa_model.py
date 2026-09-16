
class Girafa:
    def __init__(self, cor_primaria, cor_secundaria, crianca_id, id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.cor_primaria = cor_primaria
        self.cor_secundaria = cor_secundaria
        self.crianca_id = crianca_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "cor_primaria": self.cor_primaria,
            "cor_secundaria": self.cor_secundaria,
            "crianca_id": self.crianca_id,
        }

    def para_insercao(self):
        return {
            "crianca_id": self.crianca_id,
        }