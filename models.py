from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class ContaFamilia(db.Model):
    __tablename__ = 'conta_familia'

    id_conta = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pin = db.Column(db.String(10), nullable=False)

    responsaveis = db.relationship('Responsavel', backref='conta', lazy=True)
    criancas = db.relationship('Crianca', backref='conta', lazy=True)
    eventos = db.relationship('EventoCalendario', backref='conta', lazy=True)
    recompensas = db.relationship('Recompensa', backref='conta', lazy=True)


class Responsavel(db.Model):
    __tablename__ = 'responsavel'

    id_responsavel = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    senha = db.Column(db.String(255), nullable=False)

    conta_id = db.Column(db.Integer, db.ForeignKey('conta_familia.id_conta'), nullable=False)


class EventoCalendario(db.Model):
    __tablename__ = 'evento_calendario'

    id_evento = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(30), nullable=False)
    descricao = db.Column(db.String(50))
    data_hora = db.Column(db.DateTime, nullable=False)

    conta_id = db.Column(db.Integer, db.ForeignKey('conta_familia.id_conta'), nullable=False)


class Recompensa(db.Model):
    __tablename__ = 'recompensa'

    id_recompensa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(10), nullable=False)
    custo_moedas = db.Column(db.Integer, nullable=False)

    conta_id = db.Column(db.Integer, db.ForeignKey('conta_familia.id_conta'), nullable=False)


class Crianca(db.Model):
    __tablename__ = 'crianca'

    id_crianca = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    senha = db.Column(db.String(255), nullable=False)

    moedas = db.Column(db.Integer, nullable=False, default=0)
    xp = db.Column(db.Integer, nullable=False, default=0)
    strike_atual = db.Column(db.Integer, nullable=False, default=0)
    nivel = db.Column(db.Integer, nullable=False, default=0)

    cor_girafa = db.Column(db.String(15), default='amarelo')
    bolinha_girafa = db.Column(db.String(15), default='marrom')

    conta_familia_id = db.Column(db.Integer, db.ForeignKey('conta_familia.id_conta'), nullable=False)

    tarefas = db.relationship('Tarefa', backref='crianca', lazy=True)
    historico = db.relationship('HistoricoMoeda', backref='crianca', lazy=True)


class Tarefa(db.Model):
    __tablename__ = 'tarefa'

    id_tarefa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, default=None)
    status = db.Column(db.String(30), nullable=False, default='pendente')
    horario_limite = db.Column(db.DateTime, nullable=False)
    data_conclusao = db.Column(db.DateTime, nullable=False)

    moedas_ganhas = db.Column(db.Integer, nullable=False)
    moedas_perda = db.Column(db.Integer, nullable=False)
    moedas_atraso = db.Column(db.Integer, nullable=False)
    xp_ganho = db.Column(db.Integer, nullable=False)
    foto_comprovacao = db.Column(db.String(255), default=None)

    crianca_id = db.Column(db.Integer, db.ForeignKey('crianca.id_crianca'), nullable=False)

    mensagens = db.relationship('MensagemTarefa', backref='tarefa', lazy=True)


class MensagemTarefa(db.Model):
    __tablename__ = 'mensagem_tarefa'

    id_mensagem = db.Column(db.Integer, primary_key=True, autoincrement=True)
    texto = db.Column(db.Text, nullable=False)
    data_envio = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())
    tipo_remetente = db.Column(db.String(30), nullable=False)

    tarefa_id = db.Column(db.Integer, db.ForeignKey('tarefa.id_tarefa'), nullable=False)


class HistoricoMoeda(db.Model):
    __tablename__ = 'historico_moeda'

    id_historico = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tipo = db.Column(db.Boolean, nullable=False)
    data_hora = db.Column(db.DateTime, nullable=False)
    valor = db.Column(db.Integer, nullable=False)

    crianca_id = db.Column(db.Integer, db.ForeignKey('crianca.id_crianca'), nullable=False)


class Resgate(db.Model):
    # registro de recompensa cada crianca resgato e quando !!!tabela nova!!! para a tela de premios
    __tablename__ = 'resgate'

    id_resgate = db.Column(db.Integer, primary_key=True, autoincrement=True)
    data_hora = db.Column(db.DateTime, nullable=False)

    crianca_id = db.Column(db.Integer, db.ForeignKey('crianca.id_crianca'), nullable=False)
    recompensa_id = db.Column(db.Integer, db.ForeignKey('recompensa.id_recompensa'), nullable=False)

    crianca = db.relationship('Crianca', backref='resgates', lazy=True)
    recompensa = db.relationship('Recompensa', backref='resgates', lazy=True)
