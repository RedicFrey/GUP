"""
Popula o banco com dados de teste: uma conta_familia, um responsavel,
uma crianca e algumas tarefas em status diferentes.
Rode depois de criar o schema (bd_gup.sql) e ajustar config.py:

    python3 seed.py
"""
from datetime import datetime

from werkzeug.security import generate_password_hash

from app import app
from models import db, ContaFamilia, Responsavel, Crianca, Tarefa, Recompensa, EventoCalendario

with app.app_context():
    conta = ContaFamilia(pin='1234')
    db.session.add(conta)
    db.session.flush()  # garante conta.id_conta antes de usá-lo

    responsavel = Responsavel(
        nome='Alessandra',
        email='alessandra@teste.com',
        senha=generate_password_hash('123456'),
        conta_id=conta.id_conta
    )
    db.session.add(responsavel)

    crianca = Crianca(
        nome='João',
        email='joao@teste.com',
        senha=generate_password_hash('123456'),
        moedas=1700,
        xp=320,
        nivel=4,
        conta_familia_id=conta.id_conta
    )
    db.session.add(crianca)
    db.session.flush()

    tarefas = [
        ('Lavar a louça', 'pendente', 150, 30, 20, 10),
        ('Arrumar a cama', 'verificar', 80, 15, 10, 5),
        ('Fazer a lição de casa', 'refazer', 200, 40, 25, 15),
        ('Guardar os brinquedos', 'concluido', 100, 20, 15, 8),
    ]
    for titulo, status, moedas_ganhas, moedas_perda, moedas_atraso, xp_ganho in tarefas:
        db.session.add(Tarefa(
            titulo=titulo,
            status=status,
            horario_limite=datetime.now(),
            data_conclusao=datetime.now(),
            moedas_ganhas=moedas_ganhas,
            moedas_perda=moedas_perda,
            moedas_atraso=moedas_atraso,
            xp_ganho=xp_ganho,
            crianca_id=crianca.id_crianca
        ))

    recompensas = [
        ('30 min de videogame extra', 100),
        ('Escolher o filme do fim de semana', 250),
        ('Ir ao parque', 400),
    ]
    for nome, custo in recompensas:
        db.session.add(Recompensa(
            nome=nome, status='ativa', custo_moedas=custo, conta_id=conta.id_conta
        ))

    db.session.add(EventoCalendario(
        titulo='Consulta no dentista',
        descricao='Levar o cartão do convênio',
        data_hora=datetime(2026, 8, 20, 15, 0),
        conta_id=conta.id_conta
    ))

    db.session.commit()
    print("Dados de teste inseridos com sucesso.")
    print("Responsavel -> email: alessandra@teste.com | senha: 123456")
    print("Crianca     -> email: joao@teste.com | senha: 123456")
