
class HistoricoMoeda:
    def __init__(self, titulo, tipo_valor, valor, origem, crianca_id, id=None,
                 data_criacao=None, data_atualizacao=None):
        self.id = id
        self.titulo = titulo
        self.origem = origem
        self.tipo_valor = tipo_valor
        self.valor = valor
        self.crianca_id = crianca_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "origem": self.origem,
            "tipo_valor": self.tipo_valor,
            "valor": self.valor,
            "crianca_id": self.crianca_id,
            "data_criacao": self.data_criacao
        }

    def para_insercao(self):
        return {
            "titulo": self.titulo,
            "origem": self.origem,
            "tipo_valor": self.tipo_valor,
            "valor": self.valor,
            "crianca_id": self.crianca_id
        }