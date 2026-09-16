from repositories.base_repository import BaseRepository
from models.responsavel_model import Responsavel
from models.usuario_model import Usuario

class ResponsavelRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="responsaveis", modelo=Responsavel)

    def criar(self, dados_responsavel: dict):
        cursor = self.conexao.cursor()
        try:
            colunas = ", ".join(dados_responsavel.keys())
            placeholders = ", ".join(["%s"] * len(dados_responsavel))
            query = f"INSERT INTO {self.tabela} ({colunas}) VALUES ({placeholders})"
            cursor.execute(query, tuple(dados_responsavel.values()))
            return dados_responsavel["usuario_id"]
        finally:
            cursor.close()

    def atualizar(self, usuario_id, dados_dict):
        return super().atualizar(usuario_id, dados_dict, nome_coluna_id="usuario_id")

    def deletar(self, usuario_id):
        return super().deletar(usuario_id, nome_coluna_id="usuario_id")

    def buscar_por_id(self, usuario_id):
        cursor = self.conexao.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.nome, u.email, u.data_nasc, u.conta_id, u.tipo_usuario,
                   r.cargo
            FROM usuarios u
            JOIN responsaveis r ON r.usuario_id = u.id
            WHERE u.id = %s
        """, (usuario_id,))
        linha = cursor.fetchone()
        cursor.close()
        return self._arrumar_responsavel(linha) if linha else None

    def buscar_responsaveis_por_conta(self, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.nome, u.email, u.data_nasc, u.conta_id, u.tipo_usuario,
                   r.cargo
            FROM usuarios u
            JOIN responsaveis r ON r.usuario_id = u.id
            WHERE u.conta_id = %s
        """, (conta_id,))
        resultados = cursor.fetchall()
        cursor.close()
        return [self._arrumar_responsavel(linha) for linha in resultados]

    def _arrumar_responsavel(self, linha):
        usuario = Usuario(
            id=linha["id"], nome=linha["nome"], email=linha["email"],
            data_nasc=linha["data_nasc"], conta_id=linha["conta_id"],
            tipo_usuario=linha["tipo_usuario"],
        )
        return Responsavel(usuario=usuario, cargo=linha["cargo"])