const filtroCriancas = document.querySelector("#filtro-criancas");
const conteudoRelatorio = document.querySelector("#conteudo-relatorio");
const mensagem = document.querySelector("#mensagem");

function idCriancaDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("crianca_id");
}

function renderizarFiltro(criancas, criancaAtualId) {
  if (!criancas.length) {
    filtroCriancas.innerHTML = "";
    return;
  }

  filtroCriancas.innerHTML =
    "<strong>Ver relatório de:</strong> " +
    criancas
      .map(
        (c) =>
          `<a class="chip ${c.id == criancaAtualId ? "ativo" : ""}" href="relatorio.html?crianca_id=${c.id}">${c.nome}</a>`
      )
      .join(" ");
}

function renderizarRelatorio(relatorio) {
  const tarefasHtml = relatorio.tarefas_concluidas.length
    ? `<ul>${relatorio.tarefas_concluidas
        .map(
          (t) =>
            `<li>${t.titulo} — concluída em ${t.data_conclusao ? formatarDataEHorario(t.data_conclusao) : "—"} (+${t.moedas_ganha} moedas)</li>`
        )
        .join("")}</ul>`
    : "<p>Nenhuma tarefa concluída ainda.</p>";

  return `
    <h3>${relatorio.crianca.nome}</h3>
    <table>
      <tr><td>Total de tarefas</td><td>${relatorio.total_tarefas}</td></tr>
      <tr><td>Tarefas concluídas</td><td>${relatorio.total_concluidas}</td></tr>
      <tr><td>Tarefas pendentes</td><td>${relatorio.total_pendentes}</td></tr>
      <tr><td>Aguardando aprovação</td><td>${relatorio.total_em_espera}</td></tr>
      <tr><td>Taxa de conclusão</td><td>${relatorio.taxa_conclusao}%</td></tr>
      <tr><td>Moedas ganhas (tarefas)</td><td>${relatorio.moedas_ganhas}</td></tr>
      <tr><td>XP ganho</td><td>${relatorio.xp_ganho}</td></tr>
    </table>

    <h4>Tarefas concluídas</h4>
    ${tarefasHtml}
  `;
}

async function carregarRelatorio() {
  const criancaId = idCriancaDaUrl();
  const caminho = criancaId ? `/relatorios/?crianca_id=${criancaId}` : "/relatorios/";

  const resposta = await apiFetch(caminho);

  if (resposta.status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (erroMensagem(resposta, mensagem, "Erro ao carregar relatório")) return;

  const { dados } = resposta;

  renderizarFiltro(dados.criancas, dados.relatorio.crianca.id);
  conteudoRelatorio.innerHTML = renderizarRelatorio(dados.relatorio);
}

document.addEventListener("DOMContentLoaded", () => {
  carregarRelatorio();
});