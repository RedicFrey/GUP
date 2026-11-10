from models import db
from models.giraffe_item_model import GiraffeColorModel, GiraffeBackgroundModel, GiraffeAccessoryModel

CORES = [
    {"name": "amarelo", "image_url": "/static/giraffes/colors/color_primary.png", "required_level": 1},
    {"name": "azul", "image_url": "/static/giraffes/colors/color_secondary.png", "required_level": 3},
]

FUNDOS = [
    {"name": "beach", "image_url": "/static/giraffes/backgrounds/background_29.png", "required_level": 1},
    {"name": "jungle", "image_url": "/static/giraffes/backgrounds/background_8.png", "required_level": 1},
    {"name": "night city", "image_url": "/static/giraffes/backgrounds/background_9.png", "required_level": 2},
    {"name": "taiga", "image_url": "/static/giraffes/backgrounds/background_10.png", "required_level": 2},
    {"name": "night beach", "image_url": "/static/giraffes/backgrounds/background_2.png", "required_level": 2},
    {"name": "space", "image_url": "/static/giraffes/backgrounds/background_15.png", "required_level": 5},
    {"name": "future city", "image_url": "/static/giraffes/backgrounds/background_3.png", "required_level": 4},
    {"name": "snow", "image_url": "/static/giraffes/backgrounds/background_4.png", "required_level": 4},
    {"name": "sky", "image_url": "/static/giraffes/backgrounds/background_21.png", "required_level": 3},
    {"name": "sky", "image_url": "/static/giraffes/backgrounds/background_30.png", "required_level": 5},
    {"name": "city", "image_url": "/static/giraffes/backgrounds/background_11.png", "required_level": 3},
    {"name": "mountain", "image_url": "/static/giraffes/backgrounds/background_16.png", "required_level": 4},
]

ACESSORIOS = [
    {"name": "glass", "image_url": "/static/giraffes/accessories/accessory_3.png", "required_level": 1},
    {"name": "spider-man", "image_url": "/static/giraffes/accessories/accessory_2.png", "required_level": 3},
    {"name": "mask", "image_url": "/static/giraffes/accessories/accessory_5.png", "required_level": 5},
    {"name": "scarf", "image_url": "/static/giraffes/accessories/accessory_4.png", "required_level": 2},
    {"name": "super sayajin", "image_url": "/static/giraffes/accessories/accessory_1.png", "required_level": 5},
]


def _popular_se_vazia(modelo, itens):
    """Insere os itens só se a tabela ainda não tiver nenhum registro."""
    if db.session.query(modelo).first() is None:
        db.session.add_all([modelo(**item) for item in itens])


def popular_girafas():
    _popular_se_vazia(GiraffeColorModel, CORES)
    _popular_se_vazia(GiraffeBackgroundModel, FUNDOS)
    _popular_se_vazia(GiraffeAccessoryModel, ACESSORIOS)
    db.session.commit()