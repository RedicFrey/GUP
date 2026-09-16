
class Recompensa:
    def __init__(self, nome, custo_moedas, conta_id, id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.nome = nome
        self.custo_moedas = custo_moedas
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao
        self.conta_id = conta_id

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "custo_moedas": self.custo_moedas,
            "conta_id": self.conta_id
        }

    def para_insercao(self):
        return {
            "nome": self.nome,
            "custo_moedas": self.custo_moedas,
            "conta_id": self.conta_id
        }
