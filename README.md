# GUP

Um aplicativo mobile voltado para famílias que transforma obrigações, metas e tarefas do cotidiano em um sistema gamificado de recompensas com moeda virtual.

O aplicativo funciona como uma ponte digital entre pais e filhos, criando responsabilidade, transparência e aprendizado sobre o valor do esforço desde a infância.

## Stack

- **Frontend:** HTML e CSS
- **Backend:** Python | Flask
- **Banco de dados:** MySQL

## Fundadores

- Alexandre Vieira Barbosa
- Augusto Abalen Dias Duarte de Faria
- Daniel Corradi Lavarini
- Guilherme Wille Guimarães
- Miguel Oliveira
- Pedro Henrique Texeira
- Rafael Almeida Schmitberger


## Como rodar

1. Crie o banco no sql

   sql: CREATE DATABASE bd_gup;

2. Mudar `config.py` com o usuario/senha do seu MySQL:
 
   DB_USER = 'root'
   DB_PASSWORD = 'senha'
   DB_HOST = 'localhost'
   DB_NAME = 'bd_gup'

  o padrao geralmente é user = root | senha = ''

3. Instale as dependências:

    bash: pip install -r requirements.txt

4. Crie as tabelas a partir dos modelos:

    bash: python3 create_db.py
  
5. se quiser usar o seed:

    bash:python3 seed.py
   
   Isso cria:
   - Responsável: `alessandra@teste.com` / `123456`
   - Filho: `joao@teste.com` / `123456`

6. Rode o servidor:

   bash: python3 app.py
