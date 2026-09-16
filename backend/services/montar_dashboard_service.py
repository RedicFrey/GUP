from services.tarefa.listar_tarefa_crianca_service import ListarTarefasPorCriancaService
from services.tarefa.listar_tarefa_responsavel_service import ListarTarefasPorResponsavelService
from services.evento.listar_usuarios_evento_service import ListarEventoUsuarioService
from services.usuario.crianca.listar_crianca_service import ListarCriancaService
from services.recompensa.listar_recompensa_service import ListarRecompensaService


class MontarDashboardService:
    def __init__(self, conexao):
        self.conexao = conexao
        self.evento_service = ListarEventoUsuarioService(conexao)
        self.tarefa_responsavel_service = ListarTarefasPorResponsavelService(conexao)
        self.tarefa_crianca_service = ListarTarefasPorCriancaService(conexao)
        self.crianca_service = ListarCriancaService(conexao)
        self.recompensa_service = ListarRecompensaService(conexao)

    def montar(self, usuario_id, tipo_usuario, email, nome):
        eventos = self.evento_service.listar_eventos_usuario(usuario_id)

        if tipo_usuario == 'responsavel':
            tarefas = self.tarefa_responsavel_service.listar_tarefas(usuario_id)
            return {
                "tem_familia": True,
                "tipo_usuario": "responsavel",
                "email": email,
                "nome": nome,
                "tarefas": tarefas,
                "eventos": eventos,
            }

        # criança
        tarefas = self.tarefa_crianca_service.listar_tarefas(usuario_id)
        crianca = self.crianca_service.listar_crianca(usuario_id)

        informacoes_meta = None
        if crianca.meta_id:
            meta_escolhida = self.recompensa_service.listar_recompensa(crianca.meta_id)
            if meta_escolhida:
                informacoes_meta = {
                    "nome": meta_escolhida.nome,
                    "custo": meta_escolhida.custo_moedas,
                    "moedas_atuais": crianca.moedas,
                }

        return {
            "tem_familia": True,
            "tipo_usuario": "crianca",
            "email": email,
            "nome": nome,
            "info_meta": informacoes_meta,
            "tarefas": tarefas,
            "eventos": eventos,
        }