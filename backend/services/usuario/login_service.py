from werkzeug.security import check_password_hash
from exceptions import DadosInvalidos
from repositories.usuario_repository import UsuarioRepository


class LoginService:
    def __init__(self, conexao, ):
        self.conexao = conexao
        self.usuario_repo = UsuarioRepository(conexao)
    
    def autenticar(self, dados: dict):
        campos_obrigatorios = ["email", "senha"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise DadosInvalidos("Email e senha são obrigatórios.")

        usuario = self.usuario_repo.buscar_por_email(dados["email"])

        if usuario is None:
            raise DadosInvalidos("Email ou senha inválidos.")

        if not check_password_hash(usuario.senha, dados["senha"]):
            raise DadosInvalidos("Email ou senha inválidos.")

        return usuario.to_dict()