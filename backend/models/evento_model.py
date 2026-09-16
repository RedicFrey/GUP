
class Evento:
    def __init__(self, titulo, data, usuario_id, id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.titulo = titulo
        self.data = data
        self.usuario_id = usuario_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "data": str(self.data) if self.data else None,
            "usuario_id": self.usuario_id,
        }

    def para_insercao(self):
        return {
            "titulo": self.titulo,
            "data": self.data,
            "usuario_id": self.usuario_id,
        }