# Molde chamada de Conta Familia
class ContaFamilia:
    # chamou o construtor que com base no molde, constroi um objeto
    def __init__(self, nome, email_dono, pin=None, id=None,
                 data_criacao=None, data_atualizacao=None):
        # quando o objeto for chamado lá fora, o self vai referênciar um de cada vez
        self.id = id
        self.nome = nome
        self.pin = pin
        self.email_dono = email_dono
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    # função to_dict
    def to_dict(self):
        # retorna um dicionario novo que copia o objeto, com as propriedades id, nome, etc
        return{
            "id": self.id,
            "nome": self.nome,
            "email_dono": self.email_dono,
        }

    def para_insercao(self):
        return{
            "nome": self.nome,
            "email_dono": self.email_dono,
            "pin": self.pin,
        }
