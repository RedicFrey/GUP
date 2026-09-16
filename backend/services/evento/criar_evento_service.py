from datetime import datetime
from models.evento_model import Evento
from repositories.base_repository import BaseRepository
from exceptions import DadosInvalidos

class CriarEventoService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.evento_repo = BaseRepository(conexao, tabela="eventos", modelo=Evento)

    def registrar_evento(self, dados):
        campos_obrigatorios = ["titulo", "data", "usuario_id"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise DadosInvalidos(f"O campo '{campo}' é obrigatório.")

        try:
            data_convertida = datetime.strptime(dados["data"], '%Y-%m-%d')
        except ValueError:
            raise DadosInvalidos("O formato da data é inválido.")
        except TypeError:
            raise DadosInvalidos("O campo 'data' deve ser uma string no formato YYYY-MM-DD.")

        evento = Evento(
            titulo=dados["titulo"],
            data=data_convertida,
            usuario_id=dados["usuario_id"],
        )

        try:
            novo_id = self.evento_repo.criar(evento.para_insercao())
            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        return self.evento_repo.buscar_por_id(novo_id).to_dict()