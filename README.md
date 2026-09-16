# GUP

Um aplicativo mobile voltado para famílias que transforma obrigações, metas e tarefas do cotidiano em um sistema gamificado de recompensas com moeda virtual.

O aplicativo funciona como uma ponte digital entre pais e filhos, criando responsabilidade, transparência e aprendizado sobre o valor do esforço desde a infância.

## Stack

- **Frontend:** HTML, CSS e JavaScript puro (SPA simples consumindo a API via `fetch`)
- **Backend:** Python | Flask (API REST em JSON)
- **ORM:** Flask-SQLAlchemy
- **Banco de dados:** SQLite (desenvolvimento) / MySQL (produção)
- **Integração:** Flask-CORS, para permitir que o frontend (rodando em outra origem/porta) consuma a API com autenticação por sessão

## Arquitetura

O projeto segue uma arquitetura em camadas, com o frontend totalmente desacoplado do backend:

```text
Frontend (HTML/CSS/JS)
        ↓  fetch (JSON)
Controller (Blueprint)
        ↓
Service (regra de negócio)
        ↓
Model (SQLAlchemy)
        ↓
Banco de Dados
```

```text
GUP/
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html
└── backend/
    ├── app.py
    ├── controllers/
    ├── models/
    ├── repositories/
    └── services/
```

## Como executar

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

A API sobe em `http://127.0.0.1:5000`.

### Frontend

```bash
cd frontend
python -m http.server 5500
```

Acesse `http://127.0.0.1:5500`.

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