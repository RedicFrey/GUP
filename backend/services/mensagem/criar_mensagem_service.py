from models.tarefa_model import Tarefa
from models.mensagem_model import MensagemTarefa
from exceptions import DadosInvalidos, NaoEncontrado
#fazer as alterações necessárias dps, na hora que for usar

class CriarMensagemTarefaService:

    @staticmethod
    def executar(tarefa_id, dados):
        tarefa = Tarefa.buscar_por_id(tarefa_id)

        if tarefa is None:
            raise NaoEncontrado("Não foi possível encontrar a tarefa")

        autor_tipo = dados.get("autor_tipo")
        mensagem_texto = dados.get("mensagem")

        if autor_tipo not in ("filho", "responsavel"):
            raise DadosInvalidos("O campo 'autor_tipo' deve ser 'filho' ou 'responsavel'")

        if not mensagem_texto:
            raise DadosInvalidos("O campo 'mensagem' é obrigatório")

        mensagem = MensagemTarefa(
            tarefa_id=tarefa_id,
            autor_tipo=autor_tipo,
            mensagem=mensagem_texto,
        )

        mensagem.salvar()
        return mensagem.to_dict()