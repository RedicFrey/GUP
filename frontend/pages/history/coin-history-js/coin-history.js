import { sideBar } from '../../../components/sidebar/sidebar.js'
import { managerCoin } from './coin-manager.js'
import { renderCardCoin, renderBalance, PAGE_SIZE } from './coin-render.js'
import { withoutChildren } from '../../../components/confirm-modal/confirm-modal.js'
import { loadFamilyContext } from '../../../utils/family-context.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { avatar } from '../../../components/avatar/avatar.js'
import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'

const mainHistory = document.querySelector('#main-coin-history')
const filterChildren = document.querySelector('.filter-children')
const filterType = document.querySelector('.filter-type')
const coinBalanceCard = document.querySelector('.coin-balance-card')
const transactionGroup = document.querySelector('.transaction-group')
const message = document.querySelector('#mensagem')

sideBar()

const urlBase = "coin-history.html"

function idUrlChild() {
  return new URLSearchParams(window.location.search).get("child_id")
}

function urlFilter() {
  const filter = new URLSearchParams(window.location.search).get("filter")
  return ["credit", "debit"].includes(filter) ? filter : null
}

function pageUrl({ childId, filter }) {
  const params = new URLSearchParams()
  if (childId) params.set("child_id", childId)
  if (filter) params.set("filter", filter)
  const query = params.toString()
  return query ? `${urlBase}?${query}` : urlBase
}


// ---------- API ----------
async function buscarHistorico() {
  const params = new URLSearchParams()
  const criancaId = idUrlChild()
  const filtro = urlFilter()
  if (criancaId) params.set("child_id", criancaId)
  if (filtro) params.set("filter", filtro)
  params.set("page", 1)
  params.set("size", PAGE_SIZE)

  const { ok, status, dados } = await apiFetch(`/historicos?${params}`)

  if (status === 401) {
    goToLogin(dados?.erro)
    return null
  }

  if (!ok) {
    transactionGroup.innerHTML = ""
    showMessage(message, dados?.erro || "Não foi possível carregar o histórico de moedas.", "erro")
    return null
  }

  return dados
}


// ---------- Paginação ----------
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
      goToLogin(dados?.erro)
      throw new Error("Sessão expirada")
    }
    if (!ok) throw new Error(dados?.erro || "Erro ao carregar histórico.")

    return dados.history ?? []
  }
}


// ---------- Filtros ----------
function renderChildChips(children, currentChildId, filter) {
  if (!children.length) {
    filterChildren.innerHTML = ""
    return
  }

  filterChildren.innerHTML = `
    <nav class="chip-row" aria-label="Escolher criança">
      ${children.map((c) => `
        <a class="chip ${String(c.id) === String(currentChildId) ? "ativo" : ""}"
          ${String(c.id) === String(currentChildId) ? 'aria-current="true"' : ""}
          href="${pageUrl({ childId: c.id, filter })}">
          ${avatar(c, { size: 28 })}${escapeHtml(c.name)}
        </a>`).join("")}
    </nav>`
}

function renderTypeFilter(childId, currentFilter) {
  const options = [
    { amount_type: null, label: "Tudo" },
    { amount_type: "credit", label: "Entradas" },
    { amount_type: "debit", label: "Saídas" },
  ]

  filterType.innerHTML = `
    <nav class="segmented" aria-label="Filtrar extrato">
      ${options.map((o) => {
        const active = o.amount_type === currentFilter
        return `<a class="${active ? "ativo" : ""}" ${active ? 'aria-current="page"' : ""}
          href="${pageUrl({ childId, filter: o.amount_type })}">${o.label}</a>`
      }).join("")}
    </nav>`
}

function renderAdjust(isResponsible, child, onSaved) {
  const slot = coinBalanceCard.querySelector(".adjust-coins-div")
  if (!slot || !isResponsible) return

  const dialogManagerCoin = document.createElement("dialog")
  const btnManagerCoin = document.createElement("button")
  btnManagerCoin.type = "button"
  btnManagerCoin.className = "btn"
  btnManagerCoin.textContent = "Ajustar moedas"
  slot.append(btnManagerCoin)
  document.body.append(dialogManagerCoin)

  btnManagerCoin.addEventListener("click", (e) => {
    e.preventDefault()
    managerCoin(dialogManagerCoin, child, onSaved)
    dialogManagerCoin.showModal()
  })
}

async function loadCoinHistory(ctx) {
  try {
    const filtro = urlFilter()

    const dados = await buscarHistorico()
    if (!dados) return

    if (ctx.isResponsible) renderChildChips(ctx.children, dados.child?.id ?? null, filtro)

    if (!dados.child) {
      transactionGroup.innerHTML = `<div class="empty"><p>Nenhuma criança encontrada.</p></div>`
      filterType.innerHTML = ""
      return
    }

    renderBalance(dados.child, coinBalanceCard, ctx.isResponsible)
    renderTypeFilter(ctx.isResponsible ? dados.child.id : null, filtro)
    renderAdjust(ctx.isResponsible, dados.child, () => window.location.reload())

    const fetchPage = makeFetchPage(dados.child.id, filtro, dados.history)
    await renderCardCoin(dados, transactionGroup, fetchPage, filtro)
  } catch (e) {
    console.error(e)
    showMessage(message, "Não foi possível carregar o histórico de moedas.", "erro")
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const ctx = await loadFamilyContext()
  if (!ctx.profile) return

  if (ctx.isResponsible && !ctx.hasChildren) {
    mainHistory.querySelectorAll(".coin-history-filters, .coin-balance-card, .coin-statement").forEach((el) => el.remove())
    const empty = document.createElement("section")
    mainHistory.append(empty)
    withoutChildren(empty)
    return
  }

  await loadCoinHistory(ctx)
})
