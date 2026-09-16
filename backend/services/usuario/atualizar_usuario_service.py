from repositories.usuario_repository import UsuarioRepository
from werkzeug.security import generate_password_hash
from exceptions import DadosInvalidos

class AtualizarUsuarioService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.usuario_repo = UsuarioRepository(conexao)

    def atualizar_usuario(self, id, dados_dict):
        if not isinstance(dados_dict, dict):
            raise TypeError(f"Esperado um dict em 'dados_dict', recebido {type(dados_dict).__name__}")

        dados_atualizar = {}

        if dados_dict.get("nome"):
            dados_atualizar["nome"] = dados_dict["nome"]

        if dados_dict.get("email"):
            dados_atualizar["email"] = dados_dict["email"]

        senha = dados_dict.get("senha")
        if senha and senha.strip():
            dados_atualizar["senha_hash"] = generate_password_hash(senha)

        if not dados_atualizar:
            raise DadosInvalidos("Nenhum dado válido para atualizar")

        try:
            self.usuario_repo.atualizar(id, dados_atualizar)
            usuario_atualizado = self.usuario_repo.buscar_por_id(id)
            self.conexao.commit()
        except Exception as e:
            self.conexao.rollback()
            raise DadosInvalidos("Não foi possível atualizar") from e

        return usuario_atualizado