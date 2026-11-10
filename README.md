# GUP

Aplicativo para famílias que transforma obrigações, metas e tarefas do cotidiano em um sistema gamificado de recompensas com moeda virtual. É uma ponte digital entre pais e filhos e estimula responsabilidade, transparência e o aprendizado sobre o valor do esforço desde a infância.

Uma **conta família** (e-mail e senha) reúne vários **perfis**: responsáveis criam tarefas e recompensas, e as crianças cumprem as tarefas, ganham moedas e XP, sobem de nível e personalizam a sua girafa.

- Diagrama de classes: [`docs/diagrama_classes.md`](docs/diagrama_classes.md)

---

## Funcionalidades Implementadas

Cada item tem tela no frontend, rota na API, Controller, Service e acesso ao banco por Model ou Repository.

**Conta família e perfis**

1. Cadastrar conta família (já cria o perfil responsável administrador)
2. Entrar na conta família com e-mail e senha (bloqueia por 15 minutos depois de 5 senhas erradas)
3. Listar os perfis da família na tela "Quem está usando?"
4. Escolher perfil, com PIN quando o perfil tem um
5. Criar perfil de criança (qualquer responsável) ou de responsável (só o admin)
6. Editar nome e PIN do perfil (cada um edita o próprio; o admin edita todos)
7. Excluir perfil (só o admin)
8. Ver os dados da conta família e todos os perfis
9. Excluir a conta família, confirmando a senha (só o admin)

**Tarefas**

10. Criar tarefa para uma ou mais crianças, com prazo, moedas, XP e foto obrigatória ou não
11. Listar tarefas no painel, com filtro por status (todas, em espera, atrasadas), criança e período
12. Listar todas as tarefas por data (hoje ou próximos dias), com as crianças de cada uma
13. Ver o detalhe de uma tarefa (responsável) e da tarefa de uma criança
14. Editar tarefa (dados e crianças; quem já enviou não pode ser removido)
15. Excluir tarefa
16. Enviar comprovação da tarefa, com foto (criança)
17. Aprovar tarefa: a criança recebe moedas e XP e pode subir de nível
18. Reprovar tarefa: volta para pendente e a criança envia de novo

**Moedas**

19. Consultar o histórico de moedas, com filtro de entradas e saídas
20. Ajustar moedas manualmente, com motivo (responsável)

**Recompensas, metas e resgates**

21. Cadastrar recompensa
22. Listar recompensas
23. Excluir recompensa
24. Comprar recompensa com moedas (criança)
25. Definir uma recompensa como meta
26. Ver a meta com a barra de progresso das moedas
27. Remover a meta
28. Listar resgates por criança
29. Marcar resgate como entregue ou voltar para pendente

**Girafa e níveis**

30. Ver a girafa da criança
31. Listar os itens da girafa (cores, fundos e acessórios) com o nível exigido
32. Personalizar a girafa com os itens liberados pelo nível
33. Aviso de subida de nível, com os itens desbloqueados
34. Barra de progresso de XP até o próximo nível

**Agenda, relatório e avisos**

35. Criar evento na agenda da família
36. Listar eventos
37. Gerar relatório mensal por criança (feitas no prazo, com atraso, não feitas e em aberto)
38. Ver e salvar as preferências de aviso por e-mail do responsável

### Integração externa

Os avisos por e-mail (boas-vindas, tarefa enviada, recompensa resgatada, evento e perfil criados) usam o SMTP do Gmail pelo `SendEmailService`. Só funcionam com `MAIL_USER` e `MAIL_APP_PASSWORD` preenchidos no `.env`. Sem eles, o envio é ignorado e o resto do sistema continua funcionando.

---

## Arquitetura

O frontend é separado do backend e conversa com ele por `fetch` (JSON), usando o cookie de sessão do Flask (`credentials: "include"`).

```text
Frontend (HTML/CSS/JS)
      │  fetch JSON + cookie de sessão
      ▼
controllers/   uma classe por recurso, herda de BaseController
      ▼
services/      uma classe por ação, método execute()
      ▼
models/        entidades + CRUD (BaseModel)      repositories/  consultas especiais
      ▼                                                ▼
MySQL (database/schema.sql)
```

| Camada | Papel |
|---|---|
| **Controllers** (`controllers/`) | Uma classe por recurso (`TaskController`, `RewardController`...), todas herdando de `BaseController`. Cada classe tem um Blueprint e um método por ação, e registra as próprias rotas com os decorators de acesso (`family_login_required`, `profile_required`, `responsible_required`, `child_required`, `admin_required`, em `utils/auth.py`). O método só lê a requisição, chama o Service e devolve o JSON. Não tem regra de negócio, SQL nem `try/except`. |
| **Services** (`services/<domínio>/`) | Uma classe por ação do sistema (`CreateTaskService`, `ApproveTaskService`, `BuyRewardService`...), sempre com o método `execute`. Valida a entrada, aplica as regras (saldo, prazos, permissões, família do recurso, desbloqueio por nível) e confirma a transação com `commit`. Não tem SQL. |
| **Models** (`models/`) | Entidades do domínio. Todas herdam de `BaseModel`, que tem o CRUD com os nomes pedidos: `salvar()`, `atualizar()`, `deletar()`, `listar_todos()`, `buscar_por_id()`, além de `buscar_por_id_e_familia()` e `listar_por_familia()`. `ProfileModel.from_row` cria um `ChildProfile` ou um `ResponsibleProfile` conforme o `profile_type`. |
| **Repositories** (`repositories/`) | Só consultas especiais: joins (tarefa com crianças, girafa com itens), filtros e paginação, relatório mensal, nível pelo XP e `SELECT ... FOR UPDATE` para não pagar uma tarefa duas vezes. Não repetem o CRUD das Models. |
| **Integração externa** (`services/email/send_email_service.py`) | `SendEmailService` é o único lugar que fala com o SMTP do Gmail. As credenciais vêm do `.env`. |
| **Exceções** (`exceptions.py`, `error_handlers.py`) | Os Services lançam só `InvalidData` (400), `Forbidden` (403) e `NotFound` (404). Um recurso de outra família sempre dá `NotFound`. `error_handlers.py` transforma tudo em `{"erro": "..."}`; erro do MySQL vira 503 e erro inesperado vira 500. |

A conexão com o MySQL é aberta em `before_request`, fica em `flask.g.connection` e é fechada em `teardown_appcontext`. Antes de fechar, o que o Service não confirmou com `commit` é desfeito.

Datas e horas usam o horário de Brasília (`utils/dates.py`). As consultas recebem a hora atual como parâmetro, em vez de usar `NOW()` do MySQL.

---

## Tecnologias

| Área | Tecnologia | Versão |
|---|---|---|
| Linguagem (backend) | Python | 3.10+ (o código usa `X \| None`) |
| Framework web | Flask | 3.0.3 |
| CORS | Flask-Cors | 4.0.1 |
| Hash de senha/PIN, upload | Werkzeug | 3.0.3 |
| Driver do banco | mysql-connector-python | 26.7.0 |
| Variáveis de ambiente | python-dotenv | 1.2.4 |
| Banco de dados | MySQL (InnoDB, utf8mb4) | 8 |
| Frontend | HTML5, CSS3, JavaScript (ES modules), sem framework | — |
| Fontes | Fredoka e Silkscreen (licença OFL, incluídas no projeto) | — |

---

## Estrutura de pastas

```text
GUP-CORS/
├── .env.example                  # modelo das variáveis de ambiente (sem valores reais)
├── docs/
│   └── diagrama_classes.md       # diagrama de classes (Mermaid)
├── backend/
│   ├── app.py                    # cria o app, CORS, sessão, conexão por requisição, blueprints
│   ├── database.py               # get_connection() com MySQL
│   ├── exceptions.py             # InvalidData, Forbidden, NotFound
│   ├── error_handlers.py         # exceções -> JSON
│   ├── requirements.txt
│   ├── controllers/              # base_controller.py + uma classe por recurso
│   ├── services/                 # uma classe por ação, separadas por domínio
│   │   ├── family_account/  profile/  child/  task/  coin_history/
│   │   ├── reward/  redemption/  giraffe/  level/  event/  report/
│   │   └── notification/  email/
│   ├── models/                   # base_model.py + entidades
│   ├── repositories/             # consultas especiais
│   ├── utils/                    # auth, dates, validators, proof (upload), login_attempts
│   ├── database/schema.sql       # banco, tabelas e dados iniciais
│   └── static/
│       ├── giraffes/             # imagens de cores, fundos e acessórios
│       └── uploads/proofs/       # fotos de comprovação (criada sozinha, fora do git)
└── frontend/
    ├── index.html                # entrada: redireciona para login, perfis ou painel
    ├── pages/                    # uma pasta por tela (HTML + CSS + JS da tela)
    │   ├── auth/  choose-profile/  home/  task/  reward/  redemption/
    │   └── history/  report/  setting/  family-account/
    ├── components/               # avatar, sidebar, confirm-modal, giraffe-view, goal-card,
    │                             # level-up-modal, level-progress, task-dialog
    ├── services/                 # api.js (apiFetch), task-api.js, perfil-service.js
    ├── utils/                    # escape-html, formatar, pagination, task-utils...
    ├── styles/                   # global.css, style.css
    ├── config/config.js          # endereço da API
    └── assets/                   # fontes e ícones
```

---

## Como instalar e executar

Pré-requisitos: **Python 3.10+** e **MySQL 8**.

### 1. Banco de dados

O `schema.sql` cria o banco `gup_db`, as tabelas e os dados iniciais (níveis e itens da girafa). Rode **uma vez só**, porque os itens da girafa são duplicados se o script for executado de novo.

```bash
mysql -u root -p < backend/database/schema.sql
```

No PowerShell o `<` não funciona: abra o arquivo no MySQL Workbench e execute o script inteiro.

### 2. Variáveis de ambiente

Na raiz do projeto, copie o modelo e preencha:

```bash
cp .env.example .env
```

No Windows: `copy .env.example .env`.

Preencha `SECRET_KEY` e os dados do banco. Para gerar uma `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

O `.env` não vai para o git. Nunca coloque chaves ou senhas no `.env.example` nem em outro arquivo do repositório.

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

No Windows, ative o ambiente com `.venv\Scripts\activate`. Se aparecer `ZoneInfoNotFoundError`, rode `pip install tzdata`.

A API sobe em `http://127.0.0.1:5000`.

### 4. Frontend (web)

Em outro terminal:

```bash
cd frontend
python -m http.server 5500
```

Acesse **`http://127.0.0.1:5500`**.

- Use `127.0.0.1`, e não `localhost`. A API está configurada em `127.0.0.1:5000`, e com endereços diferentes o cookie de login não é enviado.
- O CORS só libera as portas `5500` e `5501`.
- Os caminhos do frontend são relativos: também funciona com o Live Server do VS Code aberto na raiz do projeto (`http://127.0.0.1:5500/frontend/`).

---

## Equipe

- Alexandre Vieira Barbosa
- Augusto Abalen Dias Duarte de Faria
- Daniel Corradi Lavarini
- Guilherme Wille Guimarães
- Miguel Oliveira
- Pedro Henrique Teixeira
- Rafael Almeida Schmitberger
