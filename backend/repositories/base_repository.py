
class BaseRepository:
    # construtor pega os paramêtros, coloca no molde e inicia
    def __init__(self, connection, table, model):
        self.connection = connection
        self.table = table
        self.model = model

    # como o nome da coluna que busca, altera e deleta usa id, o nome da coluna é 
    # feito no próprio paramêtro
    # funcao de buscar por id
    def find_by_id(self, target_id, column_name_id="id"):
        # pega o cursor, uma especie de banco temporario
        # vai na conexao do objeto, e avisa que o cursor deve retornar um objeto ao invés de tupla
        cursor = self.connection.cursor(dictionary=True)
        # tenta
        try:
            # faz o select, usando o atributo do objeto, tabela
            # e usa o parametro da coluna seja id
            query = f"SELECT * FROM {self.table} WHERE {column_name_id} = %s"
            # vai ir no cursor, e usar a propriedade de execute
            # que vai executar a query em cima, e usar o parametro id como %s
            cursor.execute(query, (target_id,))
            # o resultado vai ser uma propriedade do cursor, que pega uma linha
            result = cursor.fetchone()

            # vai no atributo modelo do objeto, e usa o kwargs, que faz chave e valor de forma génerica
            return self.model(**result) if result else None
        finally:
            # fecha o cursor, em resumo, limpa o banco
            cursor.close()

    def create(self, data_dict):
        # vai pegar as chaves dos dicionarios e transformar numa lista
        # o join vai inserir um ", " para cada chave e vai virar um string
        columns = ", ".join(data_dict.keys())
        # mesma coisa com o join
        # porem, vai contar a quantidades de pares que tem no dicionario
        # multiplicar por $s e depois fazer o join
        placeholders = ", ".join(["%s"] * len(data_dict))
        # vai pegar os valores
        values = tuple(data_dict.values())
        # fazer a query
        query = f"INSERT INTO {self.table} ({columns}) VALUES ({placeholders})"

        cursor = self.connection.cursor()
        try:
            # o cursor vai executar, e recebe a query e os valores, que vão estar em formato de 
            # o dicionario.values vai trazer uma especie lista sem ser lista
            # em resumo, vai ficar um conteudo embaixo do outro mas não é lista
            # que ai sim, o comando tuple vai transformar em tupla
            cursor.execute(query, values)
            # comando do cursor que devolve o id
            return cursor.lastrowid
        finally:
            # fecha o banco temporario
            cursor.close()

    def update(self, target_id, data_dict, column_name_id="id"):
        # se não tiver nada no dicionario, devolve negativo
        if not data_dict:
            return False

        # vai na chaves, e para cada chave, faz uma lista de {c} = %s
        # o join é aplicado e vira "{c} = %s, {c} = %s" uma string
        set_clause = ", ".join([f"{c} = %s" for c in data_dict.keys()])
        # vai pegar as chaves e fazer a tupla, e pegar o id
        # como o id é o ultimo, então ele fica por ultimo,
        # o id_alvo é uma tupla, então concatena
        values = tuple(data_dict.values()) + (target_id,)
        # faz a query
        query = f"UPDATE {self.table} SET {set_clause} WHERE {column_name_id} = %s"

        # pega o cursos e salva na variavel
        cursor = self.connection.cursor()
        try:
            # executa a query, junto com os valores
            cursor.execute(query, values)
            # retorna as linhas que foram alteradas no comando anterior
            # como o update não retorna linhas, você precisa do rowcount
            # você vê a linha com as colunas alteradas
            return cursor.rowcount > 0
        finally:
            # fecha o cursor, apagando o banco temporario
            cursor.close()

    def delete(self, target_id, column_name_id="id"):
        # mesma coisa aqui...
        cursor = self.connection.cursor()
        # tenta
        try:
            # faz a query
            query = f"DELETE FROM {self.table} WHERE {column_name_id} = %s"
            # pega a query e os valores
            cursor.execute(query, (target_id,))
            # pega as linhas alteradas
            return cursor.rowcount > 0
        finally:
            # fecha o banco
            cursor.close()


