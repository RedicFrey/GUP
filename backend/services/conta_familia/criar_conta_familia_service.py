from werkzeug.security import generate_password_hash
from models.conta_familia_model import ContaFamilia
from repositories.conta_familia_repository import ContaFamiliaRepository
from repositories.responsavel_repository import ResponsavelRepository
from repositories.usuario_repository import UsuarioRepository
from flask import session
from exceptions import DadosInvalidos


class CriarContaFamiliaService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.conta_familia_repo = ContaFamiliaRepository(conexao)
        self.responsavel_repo = ResponsavelRepository(conexao)
        self.usuario_repo = UsuarioRepository(conexao)

    def registrar_conta(self, dados, id_user):
        campos_obrigatorios = ["nome", "pin", "cargo"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                raise DadosInvalidos(f"O campo '{campo}' é obrigatório.")

        pin_hash = generate_password_hash(dados["pin"])
        email_responsavel_conta = session.get("email")
        dados["email_dono"] = email_responsavel_conta

        conta_familia = ContaFamilia(
            nome=dados["nome"],
            pin=pin_hash,
            email_dono=dados["email_dono"],
        )

        try:
            nova_conta_id = self.conta_familia_repo.criar(conta_familia.para_insercao())

            self.usuario_repo.atualizar(id_user, {"conta_id": nova_conta_id})

            campos_permitido_respo = {"cargo": dados["cargo"]}
            self.responsavel_repo.atualizar(id_user, campos_permitido_respo)

            self.conexao.commit()
        except Exception:
            self.conexao.rollback()
            raise

        usuario_atualizado = self.usuario_repo.buscar_por_id(id_user)

        return (
            self.conta_familia_repo.buscar_por_id(nova_conta_id).to_dict(),
            usuario_atualizado.to_dict(),
        )