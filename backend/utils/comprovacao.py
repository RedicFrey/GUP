# utils/upload.py
import os
import uuid
from flask import current_app

EXTENSOES_PERMITIDAS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
PASTA_UPLOAD = os.path.join('uploads', 'comprovacoes')

def extensao_valida(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in EXTENSOES_PERMITIDAS

def salvar_comprovacao(arquivo):
    pasta_absoluta = os.path.join(current_app.root_path, 'static', PASTA_UPLOAD)
    os.makedirs(pasta_absoluta, exist_ok=True)

    extensao = arquivo.filename.rsplit('.', 1)[1].lower()
    nome_arquivo = f"{uuid.uuid4().hex}.{extensao}"
    arquivo.save(os.path.join(pasta_absoluta, nome_arquivo))

    return f"{PASTA_UPLOAD}/{nome_arquivo}".replace(os.sep, '/')

def remover_comprovacao(caminho_foto):
    caminho_absoluto = os.path.join(current_app.root_path, 'static', caminho_foto)
    if os.path.exists(caminho_absoluto):
        os.remove(caminho_absoluto)