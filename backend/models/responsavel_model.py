
class Responsavel:
    def __init__(self, usuario, cargo):
        self.usuario = usuario
        self.cargo = cargo

    def to_dict(self):
        return {
            **self.usuario.to_dict(),
            "cargo": self.cargo,
        }

    def para_insercao(self):
        return {
            "cargo": self.cargo,
        }