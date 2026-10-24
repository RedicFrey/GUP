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

## Funcionalidades Implementadas

Cada item abaixo funciona de ponta a ponta: tela → API Flask → controller → service → repository/model → MySQL. O nome do service responsável está entre parênteses.

### Conta família e perfis
1. Cadastrar conta família, criando junto o perfil responsável administrador (CreateFamilyAccountService)
2. Fazer login na conta família com e-mail e senha (LoginFamilyAccountService)
3. Listar os perfis da família na tela de escolha de perfil (ListFamilyProfilesService)
4. Entrar em um perfil, com PIN quando o perfil tiver um (LoginProfileService)
5. Consultar os dados da conta família e seus perfis (GetFamilyAccountService)
6. Atualizar perfil: nome, PIN e e-mail (UpdateProfileService)
7. Excluir perfil, função exclusiva do administrador (DeleteProfileService)
8. Listar as crianças da família (FamilySChildren)

### Tarefas
9. Cadastrar tarefa para uma ou mais crianças, com prazo, moedas, XP e foto obrigatória opcional (CreateTaskService)
10. Listar tarefas com filtros de status, período e criança, com paginação (ListTaskService)
11. Listar as tarefas do dia e as próximas e abrir o detalhe de uma tarefa (GetTaskService)
12. Consultar a tarefa atribuída a uma criança (ListTasksByChildService)
13. Editar tarefa (UpdateTaskService)
14. Excluir tarefa (DeleteTaskService)
15. Enviar a comprovação de uma tarefa com foto, feito pela criança (UpdateTaskStatusService)
16. Aprovar tarefa, creditando moedas e XP e subindo o nível da criança (UpdateTaskStatusService)
17. Reprovar tarefa, que volta para pendente (UpdateTaskStatusService)

### Moedas
18. Consultar o histórico de moedas com filtro de crédito/débito e paginação (ListCoinHistoryByChildService)
19. Ajustar moedas manualmente, adicionando ou removendo, com motivo obrigatório (AdjustChildCoinsService)

### Recompensas, metas e resgates
20. Cadastrar recompensa (CreateRewardService)
21. Listar as recompensas da família (ListFamilyRewardsService)
22. Excluir recompensa (DeleteRewardService)
23. Comprar (resgatar) uma recompensa com moedas (BuyRewardService)
24. Definir uma recompensa como meta (SetChildGoalService)
25. Acompanhar o progresso da meta (GetChildGoalService)
26. Remover a meta (RemoveChildGoalService)
27. Listar os resgates de uma criança, com paginação (ListRedemptionsByChildService)
28. Confirmar a entrega de um resgate (UpdateRedemptionStatusService)

### Girafa e níveis
29. Visualizar a girafa da criança (GetChildGiraffeService)
30. Listar os itens de personalização (cores, fundos e acessórios) com o nível exigido (ListGiraffeItemsService)
31. Personalizar a girafa com os itens desbloqueados pelo nível (UpdateGiraffeService)
32. Exibir o aviso de nível novo com os itens desbloqueados e marcá-lo como visto (ProfileLevelService)

### Agenda, relatório e notificações
33. Cadastrar evento na agenda da família (CreateEventService)
34. Listar os eventos da família, com paginação (ListFamilyEventsService)
35. Gerar o relatório mensal da criança: tarefas feitas no prazo, com atraso, não feitas e em aberto (GetChildMonthlyReportService)
36. Consultar as preferências de notificação (ListNotificationPreferencesService)
37. Atualizar as preferências e o e-mail de notificação (UpdateNotificationPreferencesService)


O diagram-class esta no arquivo back-end.
