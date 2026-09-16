
class Crianca:
    def __init__(self, usuario, moedas, nivel_id, xp, meta_id=None, streak_qtde=None, freezer=None,
                 data_criacao=None, data_atualizacao=None):
        self.usuario = usuario
        self.moedas = moedas
        self.xp = xp
        self.streak_qtde = streak_qtde
        self.freezer = freezer
        self.meta_id = meta_id
        self.nivel_id = nivel_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            **self.usuario.to_dict(),
            "moedas": self.moedas,
            "xp": self.xp,
            "streak": self.streak_qtde,
            "freezer": self.freezer,
            "meta_id": self.meta_id,
            "nivel_id": self.nivel_id,
        }

    def para_insercao(self):
        return {
            "moedas": self.moedas,
            "xp": self.xp,
            "nivel_id": self.nivel_id,
        }