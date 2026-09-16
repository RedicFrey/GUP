from flask import session
from repositories.responsavel_repository import ResponsavelRepository
from repositories.usuario_repository import UsuarioRepository
from exceptions import DadosInvalidos, NaoEncontrado

class AtualizarResponsavelService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.responsavel_repo = ResponsavelRepository(conexao)
        self.usuario_repo = UsuarioRepository(conexao)

    def atualizar_responsavel(self, id_user, dados):

        usuario = self.usuario_repo.buscar_por_id(id_user)
        if usuario is None:
            raise NaoEncontrado("Usuário não encontrado para ser atualizado")

        try:
            responsavel = self.responsavel_repo.atualizar(id_user, dados)
            self.conexao.commit()

        except Exception as e:
            self.conexao.rollback()
            raise DadosInvalidos("Não foi possível atualizar responsável") from e

        return responsavel