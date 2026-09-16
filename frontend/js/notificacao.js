const listaNotificacoes = document.querySelector("#lista-notificacoes");
const mensagem = document.querySelector("#mensagem");

function renderizarPedidos(pedidos) {
  if (!pedidos.length) {
    return "<p>Nenhuma solicitação pendente no momento.</p>";
  }

  return pedidos
    .map(
      (p) => `
        <div class="tarefa-card" data-id="${p.id}">
          <p><strong>${p.nome_usuario || "Usuário #" + p.usuario_id}</strong> pediu pra entrar na família.</p>
          <div class="acoes">
            <button class="sucesso" data-id="${p.id}" data-resposta="aprovado">Aprovar</button>
            <button class="perigo" data-id="${p.id}" data-resposta="recusado">Recusar</button>
          </div>
        </div>
      `
    )
    .join("");
}

async function carregarNotificacoes() {
  const { ok, status, dados } = await apiFetch("/pedidos/");

  if (status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (!ok) {
    listaNotificacoes.innerHTML = "";
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar notificações.", "erro");
    return;
  }

  listaNotificacoes.innerHTML = renderizarPedidos(dados.pedidos);

  listaNotificacoes.querySelectorAll("button[data-id]").forEach((botao) => {
    botao.addEventListener("click", () => responderPedido(botao.dataset.id, botao.dataset.resposta));
  });
}

async function responderPedido(id, resposta) {
  const { ok, dados } = await apiFetch(`/pedidos/${id}`, {
    method: "POST",
    body: { resposta },
  });

  if (!ok) {
    mostrarMensagem(mensagem, dados?.erro || "Erro ao responder solicitação.", "erro");
    return;
  }

  carregarNotificacoes();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarNotificacoes();
});