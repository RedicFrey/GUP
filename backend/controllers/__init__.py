from controllers.family_account_controller import FamilyAccountController
from controllers.profile_controller import ProfileController
from controllers.task_controller import TaskController
from controllers.coin_history_controller import CoinHistoryController
from controllers.reward_controller import RewardController
from controllers.redemption_controller import RedemptionController
from controllers.event_controller import EventController
from controllers.giraffe_controller import GiraffeController
from controllers.level_controller import LevelController
from controllers.notification_controller import NotificationController
from controllers.report_controller import ReportController

CONTROLLERS = (
    FamilyAccountController,
    ProfileController,
    TaskController,
    CoinHistoryController,
    RewardController,
    RedemptionController,
    EventController,
    GiraffeController,
    LevelController,
    NotificationController,
    ReportController,
)


def create_blueprints():
    return [controller().blueprint for controller in CONTROLLERS]
