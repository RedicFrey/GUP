from controllers.conta_familia_controller import conta_bp
from controllers.usuario_controller import usuario_bp
from controllers.dashboard_controller import dashboard_bp
from controllers.recompensa_controller import recompensa_bp
from controllers.tarefa_controller import tarefa_bp
from controllers.historico_controller import historico_bp
from controllers.evento_controller import evento_bp
from controllers.ajuste_moedas_controller import ajuste_moedas_bp
from controllers.relatorio_controller import relatorio_bp
from controllers.resgate_controller import resgate_bp
from controllers.auth.auth_conta_familia_controller import auth_conta_bp
from controllers.auth.auth_usuario_controller import auth_usuario_bp
from controllers.pedido_familia_controller import pedidos_familia_bp

all_blueprints = [
                  usuario_bp,
                  dashboard_bp,
                  conta_bp,
                  historico_bp,
                  recompensa_bp,
                  tarefa_bp,
                  evento_bp,
                  ajuste_moedas_bp,
                  relatorio_bp,
                  resgate_bp,
                  auth_conta_bp,
                  auth_usuario_bp,
                  pedidos_familia_bp
                  ]

