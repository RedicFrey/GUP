import os
import uuid
from datetime import datetime
from functools import wraps

from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

import config
from models import (
    db, Crianca, Responsavel, Tarefa, HistoricoMoeda,
    Recompensa, Resgate, EventoCalendario
)

app = Flask(__name__)
app.config.from_object(config)
db.init_app(app)

EXTENSOES_PERMITIDAS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def login_required(tipo=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if 'tipo_usuario' not in session:
                return redirect(url_for('login'))
            if tipo and session['tipo_usuario'] != tipo:
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return wrapped
    return decorator


def arquivo_permitido(nome_arquivo):
    return '.' in nome_arquivo and nome_arquivo.rsplit('.', 1)[1].lower() in EXTENSOES_PERMITIDAS


def salvar_foto(arquivo):
    """Salva o arquivo enviado em UPLOAD_FOLDER com um nome único
    e devolve o nome do arquivo salvo (ou None se nada foi enviado)."""
    if not arquivo or arquivo.filename == '':
        return None
    if not arquivo_permitido(arquivo.filename):
        return None

    extensao = secure_filename(arquivo.filename).rsplit('.', 1)[1].lower()
    nome_unico = f"{uuid.uuid4().hex}.{extensao}"

    pasta = app.config['UPLOAD_FOLDER']
    os.makedirs(pasta, exist_ok=True)
    arquivo.save(os.path.join(pasta, nome_unico))

    return nome_unico


# parte auth

@app.route('/')
def index():
    if 'tipo_usuario' in session:
        if session['tipo_usuario'] == 'responsavel':
            return redirect(url_for('responsavel_dashboard'))
        return redirect(url_for('crianca_dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        senha = request.form.get('senha', '')
        tipo = request.form.get('tipo')

        if tipo == 'responsavel':
            usuario = Responsavel.query.filter_by(email=email).first()
            if usuario and check_password_hash(usuario.senha, senha):
                session['tipo_usuario'] = 'responsavel'
                session['id_usuario'] = usuario.id_responsavel
                session['nome_usuario'] = usuario.nome
                session['conta_id'] = usuario.conta_id
                return redirect(url_for('responsavel_dashboard'))
        else:
            usuario = Crianca.query.filter_by(email=email).first()
            if usuario and check_password_hash(usuario.senha, senha):
                session['tipo_usuario'] = 'crianca'
                session['id_usuario'] = usuario.id_crianca
                session['nome_usuario'] = usuario.nome
                session['conta_id'] = usuario.conta_familia_id
                return redirect(url_for('crianca_dashboard'))

        flash('Email ou senha inválidos.')

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


# parte responsavel

def _crianca_selecionada(criancas):
    """Escolhe a criança ativa a partir de ?crianca_id=, com fallback
    para a primeira da lista. Usado nas telas do responsável."""
    crianca_id = request.args.get('crianca_id', type=int)
    return next((c for c in criancas if c.id_crianca == crianca_id), criancas[0])


@app.route('/responsavel/dashboard')
@login_required('responsavel')
def responsavel_dashboard():
    criancas = (
        Crianca.query
        .filter_by(conta_familia_id=session['conta_id'])
        .order_by(Crianca.id_crianca)
        .all()
    )

    if not criancas:
        return render_template(
            'responsavel_dashboard.html',
            crianca=None, criancas=[], tarefas=[], moedas_hoje=0
        )

    crianca_atual = _crianca_selecionada(criancas)

    tarefas = (
        Tarefa.query
        .filter_by(crianca_id=crianca_atual.id_crianca)
        .order_by(Tarefa.horario_limite.desc())
        .limit(10)
        .all()
    )

    moedas_hoje = (
        db.session.query(db.func.coalesce(db.func.sum(HistoricoMoeda.valor), 0))
        .filter(
            HistoricoMoeda.crianca_id == crianca_atual.id_crianca,
            HistoricoMoeda.tipo.is_(True),
            db.func.date(HistoricoMoeda.data_hora) == datetime.now().date()
        )
        .scalar()
    )

    return render_template(
        'responsavel_dashboard.html',
        crianca=crianca_atual,
        criancas=criancas,
        tarefas=tarefas,
        moedas_hoje=moedas_hoje
    )


@app.route('/responsavel/tarefa/<int:id_tarefa>/aprovar', methods=['POST'])
@login_required('responsavel')
def aprovar_tarefa(id_tarefa):
    tarefa = Tarefa.query.get_or_404(id_tarefa)

    tarefa.status = 'concluido'

    crianca = db.session.get(Crianca, tarefa.crianca_id)
    crianca.moedas += tarefa.moedas_ganhas
    crianca.xp += tarefa.xp_ganho

    db.session.add(HistoricoMoeda(
        tipo=True,
        data_hora=datetime.now(),
        valor=tarefa.moedas_ganhas,
        crianca_id=crianca.id_crianca
    ))

    db.session.commit()
    return redirect(url_for('responsavel_dashboard', crianca_id=crianca.id_crianca))


@app.route('/responsavel/tarefa/<int:id_tarefa>/recusar', methods=['POST'])
@login_required('responsavel')
def recusar_tarefa(id_tarefa):
    tarefa = Tarefa.query.get_or_404(id_tarefa)
    tarefa.status = 'refazer'
    db.session.commit()
    return redirect(url_for('responsavel_dashboard', crianca_id=tarefa.crianca_id))


@app.route('/responsavel/tarefa/nova', methods=['GET', 'POST'])
@login_required('responsavel')
def nova_tarefa():
    criancas = (
        Crianca.query
        .filter_by(conta_familia_id=session['conta_id'])
        .order_by(Crianca.id_crianca)
        .all()
    )

    if not criancas:
        flash('Cadastre um(a) filho(a) antes de criar atividades.')
        return redirect(url_for('responsavel_dashboard'))

    if request.method == 'POST':
        crianca_id = request.form.get('crianca_id', type=int)
        crianca = next((c for c in criancas if c.id_crianca == crianca_id), None)
        if not crianca:
            flash('Filho(a) inválido(a).')
            return redirect(url_for('nova_tarefa'))

        horario_limite = datetime.fromisoformat(request.form['horario_limite'])

        tarefa = Tarefa(
            titulo=request.form['titulo'].strip(),
            descricao=request.form.get('descricao', '').strip() or None,
            status='pendente',
            horario_limite=horario_limite,
            # a coluna não aceita NULL; até a atividade ser concluída de
            # fato, usamos o próprio prazo como valor provisório
            data_conclusao=horario_limite,
            moedas_ganhas=request.form.get('moedas_ganhas', type=int, default=0),
            moedas_perda=request.form.get('moedas_perda', type=int, default=0),
            moedas_atraso=request.form.get('moedas_atraso', type=int, default=0),
            xp_ganho=request.form.get('xp_ganho', type=int, default=0),
            crianca_id=crianca.id_crianca
        )
        db.session.add(tarefa)
        db.session.commit()
        flash('Atividade criada com sucesso!')
        return redirect(url_for('responsavel_dashboard', crianca_id=crianca.id_crianca))

    crianca_atual = _crianca_selecionada(criancas)
    return render_template('nova_tarefa.html', crianca=crianca_atual, criancas=criancas)


# parte crianca

@app.route('/crianca/dashboard')
@login_required('crianca')
def crianca_dashboard():
    crianca = Crianca.query.get_or_404(session['id_usuario'])

    tarefas = (
        Tarefa.query
        .filter_by(crianca_id=crianca.id_crianca)
        .order_by(Tarefa.horario_limite.desc())
        .limit(10)
        .all()
    )

    moedas_hoje = (
        db.session.query(db.func.coalesce(db.func.sum(HistoricoMoeda.valor), 0))
        .filter(
            HistoricoMoeda.crianca_id == crianca.id_crianca,
            HistoricoMoeda.tipo.is_(True),
            db.func.date(HistoricoMoeda.data_hora) == datetime.now().date()
        )
        .scalar()
    )

    return render_template(
        'crianca_dashboard.html',
        crianca=crianca,
        tarefas=tarefas,
        moedas_hoje=moedas_hoje
    )


@app.route('/crianca/tarefa/<int:id_tarefa>/concluir', methods=['POST'])
@login_required('crianca')
def concluir_tarefa(id_tarefa):
    tarefa = Tarefa.query.filter_by(
        id_tarefa=id_tarefa, crianca_id=session['id_usuario']
    ).first_or_404()

    nome_foto = salvar_foto(request.files.get('foto'))
    if nome_foto:
        tarefa.foto_comprovacao = nome_foto

    tarefa.status = 'verificar'
    tarefa.data_conclusao = datetime.now()
    db.session.commit()

    return redirect(url_for('crianca_dashboard'))


# parte recompensa

@app.route('/recompensas')
@login_required()
def recompensas():
    eh_responsavel = session['tipo_usuario'] == 'responsavel'

    if eh_responsavel:
        criancas = (
            Crianca.query
            .filter_by(conta_familia_id=session['conta_id'])
            .order_by(Crianca.id_crianca)
            .all()
        )
        crianca = _crianca_selecionada(criancas) if criancas else None
    else:
        crianca = Crianca.query.get_or_404(session['id_usuario'])

    lista_recompensas = (
        Recompensa.query
        .filter_by(conta_id=session['conta_id'])
        .order_by(Recompensa.custo_moedas)
        .all()
    )

    return render_template(
        'recompensas.html',
        recompensas=lista_recompensas,
        crianca=crianca,
        eh_responsavel=eh_responsavel
    )


@app.route('/responsavel/recompensa/nova', methods=['POST'])
@login_required('responsavel')
def nova_recompensa():
    nome = request.form.get('nome', '').strip()
    custo = request.form.get('custo_moedas', type=int)

    if not nome or not custo or custo <= 0:
        flash('Preencha nome e custo (em moedas) da recompensa.')
    else:
        db.session.add(Recompensa(
            nome=nome, status='ativa', custo_moedas=custo, conta_id=session['conta_id']
        ))
        db.session.commit()

    return redirect(url_for('recompensas'))


@app.route('/responsavel/recompensa/<int:id_recompensa>/excluir', methods=['POST'])
@login_required('responsavel')
def excluir_recompensa(id_recompensa):
    recompensa = Recompensa.query.filter_by(
        id_recompensa=id_recompensa, conta_id=session['conta_id']
    ).first_or_404()
    db.session.delete(recompensa)
    db.session.commit()
    return redirect(url_for('recompensas'))


@app.route('/crianca/recompensa/<int:id_recompensa>/resgatar', methods=['POST'])
@login_required('crianca')
def resgatar_recompensa(id_recompensa):
    crianca = Crianca.query.get_or_404(session['id_usuario'])
    recompensa = Recompensa.query.filter_by(
        id_recompensa=id_recompensa, conta_id=session['conta_id']
    ).first_or_404()

    if crianca.moedas < recompensa.custo_moedas:
        flash('Moedas insuficientes para essa recompensa.')
        return redirect(url_for('recompensas'))

    crianca.moedas -= recompensa.custo_moedas

    db.session.add(HistoricoMoeda(
        tipo=False,
        data_hora=datetime.now(),
        valor=recompensa.custo_moedas,
        crianca_id=crianca.id_crianca
    ))
    db.session.add(Resgate(
        data_hora=datetime.now(),
        crianca_id=crianca.id_crianca,
        recompensa_id=recompensa.id_recompensa
    ))

    db.session.commit()
    flash(f'Você resgatou "{recompensa.nome}"!')
    return redirect(url_for('recompensas'))


# historicoo

@app.route('/historico')
@login_required()
def historico():
    eh_responsavel = session['tipo_usuario'] == 'responsavel'

    if eh_responsavel:
        criancas = (
            Crianca.query
            .filter_by(conta_familia_id=session['conta_id'])
            .order_by(Crianca.id_crianca)
            .all()
        )
        if not criancas:
            flash('Cadastre um(a) filho(a) para ver o histórico.')
            return redirect(url_for('responsavel_dashboard'))
        crianca = _crianca_selecionada(criancas)
    else:
        criancas = []
        crianca = Crianca.query.get_or_404(session['id_usuario'])

    lista_historico = (
        HistoricoMoeda.query
        .filter_by(crianca_id=crianca.id_crianca)
        .order_by(HistoricoMoeda.data_hora.desc())
        .limit(30)
        .all()
    )

    return render_template(
        'historico.html',
        historico=lista_historico,
        crianca=crianca,
        criancas=criancas,
        eh_responsavel=eh_responsavel
    )


# parte calendario

@app.route('/calendario')
@login_required()
def calendario():
    eh_responsavel = session['tipo_usuario'] == 'responsavel'

    if eh_responsavel:
        criancas = (
            Crianca.query
            .filter_by(conta_familia_id=session['conta_id'])
            .order_by(Crianca.id_crianca)
            .all()
        )
        if not criancas:
            flash('Cadastre um(a) filho(a) para ver o calendário de atividades.')
            return redirect(url_for('responsavel_dashboard'))
        crianca = _crianca_selecionada(criancas)
    else:
        criancas = []
        crianca = Crianca.query.get_or_404(session['id_usuario'])

    agora = datetime.now()

    futuras = (
        Tarefa.query
        .filter(
            Tarefa.crianca_id == crianca.id_crianca,
            Tarefa.status.in_(['pendente', 'refazer']),
        )
        .order_by(Tarefa.horario_limite)
        .limit(20)
        .all()
    )

    aguardando = (
        Tarefa.query
        .filter_by(crianca_id=crianca.id_crianca, status='verificar')
        .order_by(Tarefa.data_conclusao.desc())
        .limit(20)
        .all()
    )

    realizadas = (
        Tarefa.query
        .filter_by(crianca_id=crianca.id_crianca, status='concluido')
        .order_by(Tarefa.data_conclusao.desc())
        .limit(20)
        .all()
    )

    eventos = (
        EventoCalendario.query
        .filter_by(conta_id=session['conta_id'])
        .order_by(EventoCalendario.data_hora)
        .all()
    )

    return render_template(
        'calendario.html',
        crianca=crianca,
        criancas=criancas,
        futuras=futuras,
        aguardando=aguardando,
        realizadas=realizadas,
        eventos=eventos,
        agora=agora,
        eh_responsavel=eh_responsavel
    )


@app.route('/responsavel/evento/novo', methods=['POST'])
@login_required('responsavel')
def novo_evento():
    titulo = request.form.get('titulo', '').strip()
    data_hora_raw = request.form.get('data_hora')

    if not titulo or not data_hora_raw:
        flash('Preencha título e data do evento.')
        return redirect(url_for('calendario'))

    db.session.add(EventoCalendario(
        titulo=titulo,
        descricao=request.form.get('descricao', '').strip() or None,
        data_hora=datetime.fromisoformat(data_hora_raw),
        conta_id=session['conta_id']
    ))
    db.session.commit()
    return redirect(url_for('calendario'))


@app.route('/responsavel/evento/<int:id_evento>/excluir', methods=['POST'])
@login_required('responsavel')
def excluir_evento(id_evento):
    evento = EventoCalendario.query.filter_by(
        id_evento=id_evento, conta_id=session['conta_id']
    ).first_or_404()
    db.session.delete(evento)
    db.session.commit()
    return redirect(url_for('calendario'))


if __name__ == '__main__':
    app.run(debug=True)