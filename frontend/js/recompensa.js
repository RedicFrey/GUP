const formCriarRecompensaDiv = document.querySelector("#form-criar-recompensa");
const formRecompensa = document.querySelector("#form-recompensa");
const listaRecompensas = document.querySelector("#lista-recompensas");
const mensagem = document.querySelector("#mensagem");

function renderizarRecompensas(recompensas, tipoUsuario, criancaLogada) {
  if (!recompensas.length) {
    listaRecompensas.innerHTML = "<p>A lojinha está vazia! Nenhuma recompensa cadastrada ainda.</p>";
    return;
  }

  listaRecompensas.innerHTML = recompensas
    .map((r) => {
      let acoesHtml = "";

     
      const podeComprar = criancaLogada && criancaLogada.moedas >= r.custo_moedas;
      acoesHtml = `
        <div class="acoes">
          <button data-acao="comprar" data-id="${r.id}" ${podeComprar ? "" : "disabled"}>
            ${podeComprar ? `Comprar por ${r.custo_moedas} moedas` : "Saldo Insuficiente"}
          </button>
          <button data-acao="meta" data-id="${r.id}" class="secundario">Definir Meta</button>
        </div>
      `;

      return `
        <div class="tarefa-card">
          <strong>${r.nome}</strong> — 💰 Custa: ${r.custo_moedas} moedas)
          ${acoesHtml}
        </div>
      `;
    })
    .join("");

  listaRecompensas.querySelectorAll("button[data-acao]").forEach((botao) => {
    botao.addEventListener("click", () => {
      if (botao.dataset.acao === "comprar") comprarRecompensa(botao.dataset.id);
      if (botao.dataset.acao === "meta") definirMeta(botao.dataset.id);
    });
  });
}

async function comprarRecompensa(id) {
  const { ok, dados } = await apiFetch(`/recompensas/comprar/${id}`, { method: "POST" });
  if (!ok) {
    mostrarMensagem(mensagem, dados?.erro || "Erro ao comprar recompensa.", "erro");
    return;
  }
  carregarRecompensas();
}

async function definirMeta(id) {
  const respostaDefinirMeta = await apiFetch(`/recompensas/meta/${id}`, { method: "POST" });
  if (!respostaDefinirMeta.ok) {
    mostrarMensagem(mensagem, respostaDefinirMeta.dados?.erro || "Erro ao definir meta.", "erro");
    return;
  }

  mostrarMensagem(mensagem, "Meta definida com sucesso!", "sucesso");

}

async function carregarRecompensas() {
  const { ok, status, dados } = await apiFetch("/recompensas/");

  if (status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (!ok) {
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar recompensas.", "erro");
    return;
  }

  formCriarRecompensaDiv.style.display = dados.tipo_usuario === "responsavel" ? "block" : "none";
  renderizarRecompensas(dados.recompensas, dados.tipo_usuario, dados.crianca_logada);
}

formRecompensa.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dados = {
    nome: document.querySelector("#nome-recompensa").value,
    custo_moedas: document.querySelector("#custo-recompensa").value,
  };

  const { ok, dados: resposta } = await apiFetch("/recompensas/", {
    method: "POST",
    body: dados,
  });

  if (!ok) {
    mostrarMensagem(mensagem, resposta?.erro || "Erro ao criar recompensa.", "erro");
    return;
  }

  formRecompensa.reset();
  carregarRecompensas();
});

document.addEventListener("DOMContentLoaded", ()=>{
  carregarRecompensas();
})
