from repositories.base_repository import BaseRepository
from models.crianca_model import Crianca
from models.usuario_model import Usuario

class CriancaRepository(BaseRepository):
    def __init__(self, conexao):
        super().__init__(conexao, tabela="criancas", modelo=Crianca)

    def criar(self, dados_crianca: dict):
        cursor = self.conexao.cursor()
        try:
            colunas = ", ".join(dados_crianca.keys())
            placeholders = ", ".join(["%s"] * len(dados_crianca))
            query = f"INSERT INTO {self.tabela} ({colunas}) VALUES ({placeholders})"
            cursor.execute(query, tuple(dados_crianca.values()))
            return dados_crianca["usuario_id"]
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
                   c.moedas, c.meta_id, c.nivel_id, c.xp
            FROM usuarios u
            JOIN criancas c ON c.usuario_id = u.id
            WHERE u.id = %s
        """, (usuario_id,))
        linha = cursor.fetchone()
        cursor.close()
        return self._arrumar_crianca(linha) if linha else None

    def buscar_criancas_por_conta(self, conta_id):
        cursor = self.conexao.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.nome, u.email, u.data_nasc, u.conta_id, u.tipo_usuario,
                   c.moedas, c.meta_id, c.nivel_id, c.xp
            FROM usuarios u
            JOIN criancas c ON c.usuario_id = u.id
            WHERE u.conta_id = %s
        """, (conta_id,))
        resultados = cursor.fetchall()
        cursor.close()
        return [self._arrumar_crianca(linha) for linha in resultados]

    def _arrumar_crianca(self, linha):
        usuario = Usuario(
            id=linha["id"], nome=linha["nome"], email=linha["email"],
            data_nasc=linha["data_nasc"], conta_id=linha["conta_id"],
            tipo_usuario=linha["tipo_usuario"],
        )
        return Crianca(
            usuario=usuario, moedas=linha["moedas"], meta_id=linha["meta_id"],
            nivel_id=linha["nivel_id"], xp=linha["xp"],
        )