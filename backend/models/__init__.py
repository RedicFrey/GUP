from flask_sqlalchemy import SQLAlchemy

# db precisa existir ANTES dos imports das models: cada model faz "from . import db".
db = SQLAlchemy()

# importar as models registra as tabelas no metadata (usado pelo db.create_all())
from .base import ModeloBase  # noqa: E402
from .family_account_model import FamilyAccountModel  # noqa: E402
from .level_model import LevelModel  # noqa: E402
from .reward_model import RewardModel  # noqa: E402
from .profile_model import ProfileModel  # noqa: E402
from .child_model import ChildProfile  # noqa: E402
from .responsible_model import ResponsibleProfile  # noqa: E402
from .event_model import EventModel  # noqa: E402
from .task_model import TaskModel  # noqa: E402
from .task_assignment_model import TaskAssignmentModel  # noqa: E402
from .coin_history_model import CoinHistoryModel  # noqa: E402
from .redemption_model import RedemptionModel  # noqa: E402
from .giraffe_item_model import (  # noqa: E402
    GiraffeItemModel, GiraffeColorModel, GiraffeBackgroundModel, GiraffeAccessoryModel,
)
from .giraffe_model import GiraffeModel  # noqa: E402
from .notification_preference_model import NotificationPreferenceModel  # noqa: E402

__all__ = [
    "db",
    "ModeloBase",
    "FamilyAccountModel",
    "LevelModel",
    "RewardModel",
    "ProfileModel",
    "ChildProfile",
    "ResponsibleProfile",
    "EventModel",
    "TaskModel",
    "TaskAssignmentModel",
    "CoinHistoryModel",
    "RedemptionModel",
    "GiraffeItemModel",
    "GiraffeColorModel",
    "GiraffeBackgroundModel",
    "GiraffeAccessoryModel",
    "GiraffeModel",
    "NotificationPreferenceModel",
]
