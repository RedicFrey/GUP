
class Usuario:
    def __init__(self, nome, email, data_nasc, tipo_usuario, id=None, senha=None, conta_id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha = senha
        self.data_nasc = data_nasc
        self.tipo_usuario = tipo_usuario
        self.conta_id = conta_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "tipo_usuario": self.tipo_usuario,
            "data_nasc": self.data_nasc.isoformat() if self.data_nasc else None,
            "conta_id": self.conta_id,
        }

    def para_insercao(self):
            return {
                "nome": self.nome,
                "email": self.email,
                "senha": self.senha,
                "data_nasc": self.data_nasc.isoformat() if self.data_nasc else None,
                "tipo_usuario": self.tipo_usuario,
            }