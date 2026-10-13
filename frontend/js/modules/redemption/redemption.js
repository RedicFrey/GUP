import { sideBar } from '../../generic/side_bar.js'
import { renderizarFiltro, renderizarResgates, PAGE_SIZE } from './redemption_render.js'
import { familyChildren, loadMyProfile } from '../../generic/utils.js'
import { withoutChildren } from '../../generic/warning.js'

sideBar()

// ---------- monta a página ----------
const main = document.querySelector("#main-resgates");

main.innerHTML = `
  <h2 class="title-page">Resgates feitos</h1>
  <section id="redemption-containt">
    <div id="filtro-criancas" style="margin-bottom: 20px;"></div>
    <div id="lista-resgates">Carregando...</div>
    <p id="mensagem" class="mensagem"></p>
  </section>
  
`;

const redemptionContaint = main.querySelector("#redemption-containt")
const filtroCriancas = main.querySelector("#filtro-criancas");
const listaResgates = main.querySelector("#lista-resgates");
const mensagem = main.querySelector("#mensagem");

// fazer uma função para substituir isso
async function verifyChildren() {
  const profile = await loadMyProfile()
  if (profile?.profile_type !== "responsible") return true   // criança passa direto

  const children = (await familyChildren()) ?? []
  if (children.length === 0) {
    withoutChildren(redemptionContaint)
    return false
  }
  return true
}


// ---------- dados ----------
function idCriancaDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("profile_id");
}

function buscarPagina(criancaId, pagina, tamanho = PAGE_SIZE) {
  const params = new URLSearchParams();
  if (criancaId) params.set("crianca_id", criancaId);
  params.set("pagina", pagina);
  params.set("por_pagina", tamanho);
  return apiFetch(`/resgates_feitos?${params.toString()}`);
}

// Função que o paginate chama para buscar cada página.
// A primeira página já veio na carga inicial (firstPage): usa ela uma vez, sem pedir de novo.
function makeFetchPage(criancaId, firstPage) {
  let cached = firstPage

  return async (pagina, tamanho) => {
    if (pagina === 1 && cached) {
      const items = cached
      cached = null
      return items
    }

    const { ok, status, dados } = await buscarPagina(criancaId, pagina, tamanho)

    if (status === 401) {
      window.location.href = "auth.html"
      throw new Error("Sessão expirada")
    }
    if (!ok) throw new Error(dados?.erro || "Erro ao carregar resgates.")   // o paginate mostra o aviso

    return dados.dados ?? []
  }
}

async function carregarResgates() {
  const criancaId = idCriancaDaUrl();

  const { ok, status, dados } = await buscarPagina(criancaId, 1);

  if (status === 401) {
    window.location.href = "auth.html";
    return;
  }

  if (!ok) {
    listaResgates.innerHTML = "";
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar resgates.", "erro");
    return;
  }

  const isResponsible = dados.is_responsible ?? (dados.children?.length > 0);

  renderizarFiltro(dados.children, criancaId, isResponsible, filtroCriancas);

  // a primeira página já veio; as outras o paginate busca quando a pessoa navegar
  const fetchPage = makeFetchPage(criancaId, dados.dados)
  await renderizarResgates(dados.total, listaResgates, isResponsible, fetchPage);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await verifyChildren())) return
  await carregarResgates()
});
