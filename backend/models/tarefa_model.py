
class Tarefa:
    def __init__(self, titulo, horario_limite, moedas_ganha, xp_ganho,
                 crianca_id, responsavel_id, conta_id,
                 descricao=None, status="pendente", data_conclusao=None,
                 foto_comprovacao=None, id=None, data_criacao=None,
                 data_atualizacao=None):
        self.id = id
        self.titulo = titulo
        self.descricao = descricao
        self.status = status
        self.horario_limite = horario_limite
        self.data_conclusao = data_conclusao
        self.moedas_ganha = moedas_ganha
        self.xp_ganho = xp_ganho
        self.foto_comprovacao = foto_comprovacao
        self.crianca_id = crianca_id
        self.responsavel_id = responsavel_id
        self.conta_id = conta_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "status": self.status,
            "horario_limite": self.horario_limite,
            "data_conclusao": self.data_conclusao,
            "moedas_ganha": self.moedas_ganha,
            "xp_ganho": self.xp_ganho,
            "foto_comprovacao": self.foto_comprovacao,
            "crianca_id": self.crianca_id,
            "responsavel_id": self.responsavel_id,
            "conta_id": self.conta_id
        }

    def para_insercao(self):
        return {
            "titulo": self.titulo,
            "descricao": self.descricao,
            "status": self.status,
            "horario_limite": self.horario_limite,
            "moedas_ganha": self.moedas_ganha,
            "xp_ganho": self.xp_ganho,
            "crianca_id": self.crianca_id,
            "responsavel_id": self.responsavel_id,
            "conta_id": self.conta_id,
        }