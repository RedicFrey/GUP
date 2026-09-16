from werkzeug.security import check_password_hash
from repositories.conta_familia_repository import ContaFamiliaRepository
from repositories.usuario_repository import UsuarioRepository
from services.conta_familia.solicitacao_entrada_service import SolicitarEntradaService
from exceptions import DadosInvalidos, NaoEncontrado


class LoginService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.conta_familia_repo = ContaFamiliaRepository(conexao)
        self.usuario_repo = UsuarioRepository(conexao)
        self.solicitar_entrada_service = SolicitarEntradaService(conexao)

    def autenticar(self, dados: dict, usuario_id):
        campos_obrigatorios = ["email_dono", "pin"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise DadosInvalidos("Email e pin são obrigatórios.")

        conta_familia = self.conta_familia_repo.buscar_por_email(dados["email_dono"])
        if conta_familia is None:
            raise NaoEncontrado("Nenhuma conta família encontrada com esse email.")

        if not check_password_hash(conta_familia.pin, dados["pin"]):
            raise DadosInvalidos("Email ou pin inválidos.")

        usuario = self.usuario_repo.buscar_por_id(usuario_id)
        if usuario is None:
            raise NaoEncontrado("Usuário não encontrado.")

        if usuario.conta_id == conta_familia.id:
            raise DadosInvalidos("Você já faz parte desta família.")

        self.solicitar_entrada_service.solicitar(usuario.id, conta_familia.id)

        return {
            "mensagem": "Solicitação enviada. Aguarde a aprovação de um responsável da família.",
            "conta_id": conta_familia.id,
            "status": "pendente",
        }