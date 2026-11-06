class InvalidData(Exception):
    """Dados da requisição inválidos ou regra de negócio violada (HTTP 400)."""

    def __init__(self, mensagem="Dados inválidos"):
        self.mensagem = mensagem
        super().__init__(mensagem)


class Forbidden(Exception):
    """O perfil logado não tem permissão para a ação (HTTP 403)."""

    def __init__(self, mensagem="Você não tem permissão para fazer isso."):
        self.mensagem = mensagem
        super().__init__(mensagem)


class NotFound(Exception):
    """Recurso inexistente ou de outra família (HTTP 404)."""

    def __init__(self, mensagem="Recurso não encontrado"):
        self.mensagem = mensagem
        super().__init__(mensagem)
