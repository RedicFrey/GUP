class NaoEncontrado(Exception):
    def __init__(self, mensagem="Recurso não encontrado"):
        self.mensagem = mensagem
        super().__init__(self.mensagem)

class DadosInvalidos(Exception):
    def __init__(self, mensagem="Dados inválidos"):
        self.mensagem = mensagem
        super().__init__(self.mensagem)