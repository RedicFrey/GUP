# GUP

Um aplicativo voltado para famílias que transforma obrigações, metas e tarefas do cotidiano em um sistema gamificado de recompensas com moeda virtual.

O aplicativo funciona como uma ponte digital entre pais e filhos, criando responsabilidade, transparência e aprendizado sobre o valor do esforço desde a infância.

## Stack

- **Frontend:** HTML, CSS e JavaScript puro (ES modules), consumindo a API via `fetch`. O gráfico do relatório usa Chart.js (CDN).
- **Backend:** Python | Flask (API REST em JSON)
- **Banco de dados:** MySQL, acessado com `mysql-connector-python` (SQL puro, sem ORM)
- **Autenticação:** sessão do Flask (cookie)
- **Integração:** Flask-CORS, para o frontend (outra porta) usar a API com cookies

## Arquitetura

O frontend é totalmente desacoplado do backend. O backend segue camadas:

```text
Frontend (HTML/CSS/JS)
        ↓  fetch (JSON)
Controller (Blueprint)   -> recebe a requisição e devolve o JSON
        ↓
Service                  -> regra de negócio
        ↓
Repository               -> SQL
        ↓
MySQL
```

```text
GUP-CORS/
├── frontend/
│   ├── *.html                  # uma página por tela
│   ├── css/
│   └── js/
│       ├── api.js              # apiFetch e helpers globais (API_URL fica aqui)
│       ├── generic/            # sidebar, paginação, ícones, avisos...
│       ├── modules/            # tarefas, histórico, relatório, resgates...
│       ├── settings/           # configuração e conta família
│       └── user/               # login, cadastro e perfis
└── backend/
    ├── app.py
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── models/
    └── database/schema.sql
```

## Como executar

Pré-requisitos: **Python 3.10+** e **MySQL 8**.

### 1. Banco de dados

O `schema.sql` cria o banco `gup_db`, as tabelas e alguns dados iniciais (girafa).

```bash
mysql -u root -p < backend/database/schema.sql
```

No PowerShell o `<` não funciona. Abra o `backend/database/schema.sql` no MySQL Workbench e execute o script inteiro.

### 2. Variáveis de ambiente

Na raiz do projeto:

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

Preencha o `.env` (senha do banco etc.). Para a `SECRET_KEY` você pode gerar uma sua:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**O `.env` nunca vai para o git.**

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

A API sobe em `http://127.0.0.1:5000`.

### 4. Frontend

Em outro terminal:

```bash
cd frontend
python -m http.server 5500
```

Acesse **`http://127.0.0.1:5500`**.

> Use `127.0.0.1` (e não `localhost`) no navegador. A API está configurada em `127.0.0.1:5000` e, misturando os dois endereços, o cookie de login não é enviado.
> O CORS só libera as portas `5500` e `5501`.

## Páginas

| Página | O que é |
|---|---|
| `index.html` / `auth.html` | Entrada, login e cadastro |
| `profiles.html` | Escolha de perfil |
| `dashboard.html` | Tarefas do dia e eventos |
| `task.html` | Lista completa de tarefas |
| `coin_history.html` | Histórico de moedas |
| `reward.html` / `redemption.html` | Recompensas e resgates |
| `report.html` | Relatório mensal de desempenho |
| `setting.html` / `family_account.html` | Configuração, notificações e conta família |

## Dicas para quem for mexer no projeto

- **Muitas telas são montadas em JS** (`innerHTML`). Antes de renomear ou remover um `id`, um `data-*` ou uma classe, procure o nome no projeto: o JS pode depender dele. Acrescentar classes é sempre seguro.
- As fotos de comprovação ficam em `backend/static/uploads/` (a pasta é criada sozinha e não vai para o git).
- Toda permissão precisa ser conferida no **backend**. Esconder um botão no frontend não protege a rota.
- Trabalhe em uma branch e abra pull request, em vez de commitar direto na principal.

## Em desenvolvimento

- Envio de notificações por e-mail (as preferências já existem, o envio não)
- Tarefas que se repetem
- Foto de perfil
- Limites por plano

## Fundadores

- Alexandre Vieira Barbosa
- Augusto Abalen Dias Duarte de Faria
- Daniel Corradi Lavarini
- Guilherme Wille Guimarães
- Miguel Oliveira
- Pedro Henrique Teixeira
- Rafael Almeida Schmitberger

## Funcionalidades

| # | Descrição |
|---|---|
| 20 | O sistema deve permitir ao responsável colocar uma trava de PIN. |
| 19 | O sistema deve permitir ao usuário a criação de um relatório sobre o desempenho do filho, com a quantidade de tarefas concluídas. |
| 17 | O sistema deve permitir ao responsável criar uma agenda com eventos especiais e tarefas específicas. |
| 12 | O sistema deve permitir ao responsável inserir ou retirar moedas do filho, caso aconteça alguma eventualidade positiva ou negativa. |
| 10 | O sistema deve permitir ao responsável visualizar a tarefa e selecionar se ela está concluída ou não. |
| 9 | O sistema deve permitir ao filho enviar a tarefa através de um arquivo de imagem. |
| 6 | O sistema deve permitir ao usuário responsável criar atividades, contendo nome da tarefa e uma descrição. |
| 5 | O sistema deve permitir ao filho escolher qual meta quer conquistar ou qual ele pode receber. |
| 4 | O sistema deve permitir ao responsável cadastrar recompensas e metas. |
| 2 | O sistema deve permitir ao usuário visualizar o histórico de entrada e saída de moedas. |
