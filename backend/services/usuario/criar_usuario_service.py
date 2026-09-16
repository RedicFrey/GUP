from datetime import date, datetime
from werkzeug.security import generate_password_hash
from models.usuario_model import Usuario
from models.crianca_model import Crianca
from models.girafa_model import Girafa
from models.responsavel_model import Responsavel
from exceptions import DadosInvalidos
from repositories.base_repository import BaseRepository
from repositories.crianca_repository import CriancaRepository
from repositories.responsavel_repository import ResponsavelRepository
from repositories.usuario_repository import UsuarioRepository

# criado uma constante para idade minima
IDADE_MINIMA_RESPONSAVEL = 18

# criando um molde
class CriarUsuarioService:
    # iniciando o objeto, e recebendo os paramêtros
    def __init__(self, conexao):
        # usando o objeto, e cria uma propriedade para cada valor de paramêtro
        self.usuario_repo = UsuarioRepository(conexao)
        self.crianca_repo = CriancaRepository(conexao)
        self.responsavel_repo = ResponsavelRepository(conexao)
        self.conexao = conexao
        self.girafa_repo = BaseRepository(conexao, tabela="girafas", modelo=Girafa)

    # Ele não acessa um objeto, e nem recebe um self
    # apenas ganha um paramêtro e usa ele
    @staticmethod
    def calcular_idade(data_nasc: date) -> int:
        hoje = date.today()
        idade = hoje.year - data_nasc.year
        fez_aniversario = (hoje.month, hoje.day) >= (data_nasc.month, data_nasc.day)
        if not fez_aniversario:
            idade -= 1
        return idade

    # função de registrar o usuário, vai receber o dados como dicionario
    def registrar_usuario(self, dados: dict):
        # os campos obrigatorio que precisa ter
        campos_obrigatorios = ["nome", "email", "senha", "data_nasc"]
        # para cada elemento do campo
        for campo in campos_obrigatorios:
            # se não tiver o dado do elemento
            if not dados.get(campo):
                # interrompe a ação, e devolve um erro com string
                raise DadosInvalidos(f"O campo '{campo}' é obrigatório.")

        # se, no objeto, a propriedada usuario_repo, fazer a função, e retornar com o email
        if self.usuario_repo.buscar_por_email(dados["email"]):
            # interrompe e devolve
            raise DadosInvalidos("Já existe um usuário com esse email.")

        # pega o data_nasc que está no dicionario
        data_nasc = dados["data_nasc"]
        # verifica se o atributo é de um tipo
        if isinstance(data_nasc, str):
            # transforma a data de nasc
            data_nasc = datetime.strptime(data_nasc, "%Y-%m-%d").date()
        elif not isinstance(data_nasc, date):
            raise DadosInvalidos("Campo 'data_nasc' deve ser uma data válida.")

        # pelo o que eu entendi, as funções @staticmethod daqui é um método estático
        # então parece que o objeto meio que adquire ela como um método de objeto,
        # mas é um método da classe
        # que dentro do objeto tá indo na função calcular_idade
        idade = self.calcular_idade(data_nasc)
        # vai salvar dentro de senha, vai fazer a função que vem de um import
        # que recebe de dados, a propriedade senha
        senha_hash = generate_password_hash(dados["senha"])
        # verificacao de idade
        tipo_usuario = "responsavel" if idade >= IDADE_MINIMA_RESPONSAVEL else "crianca"

        # vai na classe usuário, e cria um objeto (o objeto ainda não foi salvo, só existe)
        # e salva numa variável
        usuario = Usuario(
            id=None,
            nome=dados["nome"],
            email=dados["email"],
            senha=senha_hash,
            data_nasc=data_nasc,
            conta_id=None,
            tipo_usuario=tipo_usuario,
        )

        # tenta..
        try:
            # no obejto, vai na propriedade usuario_repo, que tem a funcao cria
            # entrega usuario, que acessa para insersao que tá na propriedade criar 
            # parecendo que o "." virou acessa, e depois disso, faz o caminho reverso com 
            # o resultado
            usuario_id = self.usuario_repo.criar(usuario.para_insercao())
            # tem que olhar no repository, mas em resumo, está devolvendo o id
            usuario.id = usuario_id

            # se o usuario for responsavel, faz a mesma coisa que usuario, porem da nome e cargo
            if tipo_usuario == "responsavel":
                self.responsavel_repo.criar({"usuario_id": usuario_id, "cargo": None})
                resultado = Responsavel(usuario=usuario, cargo=None)

            # se o usuario for crianca faz a mesma coisa que responsavel, muda os atributos extras
            else:
                self.crianca_repo.criar({
                    "usuario_id": usuario_id,
                    "moedas": 0,
                    "xp": 0,
                    "meta_id": None,
                    "nivel_id": 1,
                })
                resultado = Crianca(usuario=usuario, moedas=0, meta_id=None, nivel_id=1, xp=0)

                self.girafa_repo.criar({
                    "crianca_id": usuario_id
                })

            # vai no objeto, que tem a conexao, e faz o commit, salvando no banco
            self.conexao.commit()

            # caso algo falhe
        except Exception:
            # faz o rollback, que defaz os endpoints e alterações
            self.conexao.rollback()
            raise

        # devolve o resultado, dependendo se for criança ou responsavel
        return resultado.to_dict()