DB_USER = 'root'
DB_PASSWORD = 'senha'
DB_HOST = 'localhost'
DB_NAME = 'bd_gup'

SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

SECRET_KEY = 'numeros'

# pasta onde as fotos de comprovação de tarefa ficam salvas porfavor olhem dps >.<
UPLOAD_FOLDER = 'static/uploads'
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB por upload para n foder meu pc 

#mudar nome de config_commit para apenas config se for executar
