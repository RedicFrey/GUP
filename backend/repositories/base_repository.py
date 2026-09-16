
class BaseRepository:
    # construtor pega os paramêtros, coloca no molde e inicia
    def __init__(self, conexao, tabela, modelo):
        self.conexao = conexao
        self.tabela = tabela
        self.modelo = modelo

    # como o nome da coluna que busca, altera e deleta usa id, o nome da coluna é 
    # feito no próprio paramêtro
    # funcao de buscar por id
    def buscar_por_id(self, id, nome_coluna_id="id"):
        # pega o cursor, uma especie de banco temporario
        # vai na conexao do objeto, e avisa que o cursor deve retornar um objeto ao invés de tupla
        cursor = self.conexao.cursor(dictionary=True)
        # tenta
        try:
            # faz o select, usando o atributo do objeto, tabela
            # e usa o parametro da coluna seja id
            query = f"SELECT * FROM {self.tabela} WHERE {nome_coluna_id} = %s"
            # vai ir no cursor, e usar a propriedade de execute
            # que vai executar a query em cima, e usar o parametro id como %s
            cursor.execute(query, (id,))
            # o resultado vai ser uma propriedade do cursor, que pega uma linha
            resultado = cursor.fetchone()

            # vai no atributo modelo do objeto, e usa o kwargs, que faz chave e valor de forma génerica
            return self.modelo(**resultado) if resultado else None
        finally:
            # fecha o cursor, em resumo, limpa o banco
            cursor.close()

    def criar(self, dados_dict):
        # vai pegar as chaves dos dicionarios e transformar numa lista
        # o join vai inserir um ", " para cada chave e vai virar um string
        colunas = ", ".join(dados_dict.keys())
        # mesma coisa com o join
        # porem, vai contar a quantidades de pares que tem no dicionario
        # multiplicar por $s e depois fazer o join
        placeholders = ", ".join(["%s"] * len(dados_dict))
        # vai pegar os valores
        valores = tuple(dados_dict.values())
        # fazer a query
        query = f"INSERT INTO {self.tabela} ({colunas}) VALUES ({placeholders})"

        cursor = self.conexao.cursor()
        try:
            # o cursor vai executar, e recebe a query e os valores, que vão estar em formato de 
            # o dicionario.values vai trazer uma especie lista sem ser lista
            # em resumo, vai ficar um conteudo embaixo do outro mas não é lista
            # que ai sim, o comando tuple vai transformar em tupla
            cursor.execute(query, valores)
            # comando do cursor que devolve o id
            return cursor.lastrowid
        finally:
            # fecha o banco temporario
            cursor.close()

    def atualizar(self, id_alvo, dados_dict, nome_coluna_id="id"):
        # se não tiver nada no dicionario, devolve negativo
        if not dados_dict:
            return False

        # vai na chaves, e para cada chave, faz uma lista de {c} = %s
        # o join é aplicado e vira "{c} = %s, {c} = %s" uma string
        set_clause = ", ".join([f"{c} = %s" for c in dados_dict.keys()])
        # vai pegar as chaves e fazer a tupla, e pegar o id
        # como o id é o ultimo, então ele fica por ultimo,
        # o id_alvo é uma tupla, então concatena
        valores = tuple(dados_dict.values()) + (id_alvo,)
        # faz a query
        query = f"UPDATE {self.tabela} SET {set_clause} WHERE {nome_coluna_id} = %s"

        # pega o cursos e salva na variavel
        cursor = self.conexao.cursor()
        try:
            # executa a query, junto com os valores
            cursor.execute(query, valores)
            # retorna as linhas que foram alteradas no comando anterior
            # como o update não retorna linhas, você precisa do rowcount
            # você vê a linha com as colunas alteradas
            return cursor.rowcount > 0
        finally:
            # fecha o cursor, apagando o banco temporario
            cursor.close()

    def deletar(self, id_alvo, nome_coluna_id="id"):
        # mesma coisa aqui...
        cursor = self.conexao.cursor()
        # tenta
        try:
            # faz a query
            query = f"DELETE FROM {self.tabela} WHERE {nome_coluna_id} = %s"
            # pega a query e os valores
            cursor.execute(query, (id_alvo,))
            # pega as linhas alteradas
            return cursor.rowcount > 0
        finally:
            # fecha o banco
            cursor.close()


