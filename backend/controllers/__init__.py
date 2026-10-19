from controllers.family_account_controller import family_account_bp
from controllers.giraffe_controller import giraffe_bp
from controllers.dashboard_controller import dashboard_bp
from controllers.profile_controller import profile_bp
from controllers.reward_controller import reward_bp
from controllers.task_controller import task_bp
from controllers.coin_history_controller import coin_history_bp
from controllers.event_controller import event_bp
from controllers.manager_coin_controller import manager_coin_bp
from controllers.report_controller import report_bp
from controllers.redemption_controller import redemption_bp
from controllers.notification_controller import notification_bp
from controllers.auth_controller import auth_bp
from controllers.level_controller import level_bp

all_blueprints = [
                  giraffe_bp,
                  dashboard_bp,
                  profile_bp,
                  family_account_bp,
                  coin_history_bp,
                  reward_bp,
                  task_bp,
                  event_bp,
                  manager_coin_bp,
                  report_bp,
                  redemption_bp,
                  notification_bp,
                  auth_bp,
                  level_bp,
                  ]

