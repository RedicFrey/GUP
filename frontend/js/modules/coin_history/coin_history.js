
import { sideBar } from '../../generic/side_bar.js';
import { showChildren } from '../../generic/list_children.js'
import { managerCoin } from './coin_manager.js'
import { renderCardCoin, PAGE_SIZE } from './coin_render.js'
import { withoutChildren } from '../../generic/warning.js'
import { familyChildren, loadMyProfile } from '../../generic/utils.js'

const mainHistory = document.querySelector('#main-coin-history')

// elementos criados pelo montarEsqueleto()
let filtroCriancas
let filtroTipoEl
let conteudoHistorico
let mensagem
let divManagerCoin

sideBar();
const urlBase = "coin_history.html"

function idUrlChild() {
  const params = new URLSearchParams(window.location.search);
  return params.get("child_id");
}

function urlFilter() {
  const params = new URLSearchParams(window.location.search);
  return params.get("filter"); // "entrada", "saida", ou null
}


// ---------- Estrutura da página (o HTML só tem o <main>) ----------

async function montarEsqueleto() {
  mainHistory.innerHTML = `
    <h2 class="title-page">Histórico de Moedas</h2>

    <section id="coin-history-containt">
      <div id="filtro-criancas" style="margin-bottom: 12px;"></div>
      <div id="filtro-tipo" style="margin-bottom: 20px;"></div>

      <div id="manager-coin-child-div"></div>

      <div id="conteudo-historico">Carregando...</div>

      <p id="mensagem" class="mensagem"></p>
    </section>
    
  `

  const coinHistoryContaint = mainHistory.querySelector("#coin-history-containt")
  filtroCriancas = mainHistory.querySelector("#filtro-criancas")
  filtroTipoEl = mainHistory.querySelector("#filtro-tipo")
  divManagerCoin = mainHistory.querySelector("#manager-coin-child-div")
  conteudoHistorico = mainHistory.querySelector("#conteudo-historico")
  mensagem = mainHistory.querySelector("#mensagem")
}


// ---------- API ----------

async function buscarHistorico() {
  const criancaId = idUrlChild();
  const filtro = urlFilter();

  const params = new URLSearchParams();
  if (criancaId) params.set("child_id", criancaId);
  if (filtro) params.set("filter", filtro);
  params.set("page", 1);              // primeira página; as outras vêm do paginate
  params.set("size", PAGE_SIZE);

  const query = params.toString();
  const caminho = query ? `/historicos?${query}` : "/historicos";

  const { ok, status, dados } = await apiFetch(caminho);

  if (status === 401) {
    window.location.href = "auth.html";
    return null;
  }

  if (!ok) {
    conteudoHistorico.innerHTML = "";
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar histórico.", "erro");
    return null;
  }

  return dados;
}


// ---------- Paginação ----------

// Função que o paginate chama para buscar cada página do extrato.
// A primeira página já veio na carga inicial (firstPage): usa ela uma vez, sem pedir de novo.
function makeFetchPage(childId, filtro, firstPage) {
  let cached = firstPage

  return async (page, size) => {
    if (page === 1 && cached) {
      const items = cached
      cached = null
      return items
    }

    const params = new URLSearchParams({ child_id: childId, page, size })
    if (filtro) params.set("filter", filtro)

    const { ok, status, dados } = await apiFetch(`/historicos?${params}`)

    if (status === 401) {
      window.location.href = "auth.html"
      throw new Error("Sessão expirada")
    }
    if (!ok) throw new Error(dados?.erro || "Erro ao carregar histórico.")   // o paginate mostra o aviso

    return dados.history ?? []
  }
}


// ---------- Filtros ----------

function loadFilter(children, isResponsible, childNowId, filter) {
  if (!isResponsible || !children.length) {
    filtroCriancas.innerHTML = "";
    return;
  }

    const text = "Ver histórico de:"
    showChildren(children, childNowId, filter, filtroCriancas, text, urlBase)
}

function renderizarFiltroTipo(childId, filtroAtual) {
  const options = [
    { amount_type: null, label: "Todos" },
    { amount_type: "credit", label: "Entradas" },
    { amount_type: "debit", label: "Saídas" },
  ];

  filtroTipoEl.innerHTML =
    "<strong>Mostrar:</strong> " +
    options
      .map((o) => {
        const params = new URLSearchParams();
        if (childId) params.set("child_id", childId);
        if (o.amount_type) params.set("filter", o.amount_type);
        const active = o.amount_type === filtroAtual ? "ativo" : "";
        return `<a class="chip ${active}" href="${urlBase}?${params.toString()}">${o.label}</a>`;
      })
      .join(" ");
}


// ---------- Extrato ----------

function renderizarTabela(historic) {
  if (!historic.length) {
    return "<p>Nenhuma movimentação registrada ainda.</p>";
  }

  const lines = historic
    .map((item) => {
      const entrada = item.amount_type === "credit";
      return `
        <tr>
          <td class="${entrada ? "credit" : "debit"}">${entrada ? "CREDIT" : "DEBIT"}</td>
          <td>${item.amount} moedas</td>
          <td>${item.name}</td>
          <td>${formatarDataEHorario(item.created_at)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table>
      <tr><th>Tipo</th><th>Valor</th><th>Origem</th><th>Data</th></tr>
      ${lines}
    </table>
  `;
}

async function renderizarExtrato(dados, filtro) {
  renderizarFiltroTipo(dados.child.id, filtro);

  const fetchPage = makeFetchPage(dados.child.id, filtro, dados.history)
  await renderCardCoin(dados, conteudoHistorico, fetchPage)
}


// ---------- Ajuste de moedas (só responsável) ----------

function renderizarAjuste(dados, onSaved) {
  if (!dados.is_responsible) return;

  const dialogManagerCoin = document.createElement("dialog")

  const btnManagerCoin = document.createElement("button")
  btnManagerCoin.textContent = "Alterar moedas"
  divManagerCoin.append(btnManagerCoin, dialogManagerCoin)

  btnManagerCoin.addEventListener("click", (e)=>{
    e.preventDefault()
    dialogManagerCoin.showModal()
  })

  managerCoin(dialogManagerCoin, dados.child, onSaved)   // depois de ajustar, recarrega saldo e extrato
}


// ---------- Página ----------

async function loadCoinHistory() {
  await montarEsqueleto();

  try {
    const filtro = urlFilter();

    const dados = await buscarHistorico();
    if (!dados) return;

    loadFilter(dados.children, dados.is_responsible, dados.child ? dados.child.id : null, filtro);

    if (!dados.child) {
      conteudoHistorico.innerHTML = "<p>Nenhuma criança encontrada.</p>";
      filtroTipoEl.innerHTML = "";
      return;
    }

    await renderizarExtrato(dados, filtro);
    renderizarAjuste(dados, loadCoinHistory);
  } catch {
    // tratar depois
  }
}

async function verifyChildren() {
  const profile = await loadMyProfile()
  if (profile?.profile_type !== "responsible") return true   // criança passa direto

  const children = (await familyChildren()) ?? []
  if (children.length === 0) {
    // o withoutChildren apaga o id e a classe de quem recebe, então passa um filho do <main>
    mainHistory.innerHTML = `
      <h2 class="title-page">Histórico de Moedas</h2>
      <section id="coin-history-without-children"></section>
    `
    withoutChildren(mainHistory.querySelector("#coin-history-without-children"))
    return false
  }
  return true
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await verifyChildren())) return
  await loadCoinHistory()
})
