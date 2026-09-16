
class Nivel:
    def __init__(self, acessorio, xp_necessario, id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.acessorio = acessorio
        self.xp_necessario = xp_necessario
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "acessorio": self.acessorio,
            "xp_necessario": self.xp_necessario,
        }

    def para_insercao(self):
        return {
            "acessorio": self.acessorio,
            "xp_necessario": self.xp_necessario,
        }