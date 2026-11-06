import { escapeHtml } from '../../../utils/escape-html.js'
import { paginate } from '../../../utils/pagination.js'
import { parseApiDate, diaPorExtenso } from '../../../utils/formatar.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../components/avatar/avatar.js'

export const PAGE_SIZE = 10

const EMPTY_TEXT = {
    credit: "Nenhuma moeda entrou ainda. Elas chegam quando uma tarefa é aprovada.",
    debit: "Nenhuma moeda saiu ainda.",
    all: "Nenhuma movimentação ainda. As moedas aparecem aqui quando uma tarefa é aprovada.",
}

// Cartão do saldo, no topo da página
export function renderBalance(child, container, isResponsible) {
    container.innerHTML = `
        <div class="balance-who">
            ${avatar(child, { size: 48, className: "avatar-lg" })}
            <div>
                <p class="balance-label">${isResponsible ? `Carteira de ${escapeHtml(child.name)}` : "Sua carteira"}</p>
                <p class="balance-value">
                    ${pixelIcon("coinColor", { size: 28 })}
                    <span>${escapeHtml(child.coins ?? 0)}</span>
                    <small>moedas</small>
                </p>
            </div>
        </div>
        <div class="adjust-coins-div"></div>
    `
}

export async function renderCardCoin(data, container, fetchPage, filter = null) {
    container.innerHTML = `<div id="card-containt" class="coin-list"></div>`

    const cardContaint = container.querySelector("#card-containt")
    await renderContaint(data.total, fetchPage, cardContaint, filter)
}

function getCoinState(amountType, amount) {
    if (Number(amount) === 0) return { className: "coin-zero", sign: "" }
    return amountType === "credit"
        ? { className: "coin-credit", sign: "+" }
        : { className: "coin-debit", sign: "−" }
}

const coinRowHtml = (item, day) => {
    const state = getCoinState(item.amount_type, item.amount)
    const date = parseApiDate(item.created_at)
    const time = date ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""

    return `
      <div class="coin-row ${state.className}" data-day="${escapeHtml(day)}">
        <span class="coin-badge" aria-hidden="true">${state.sign || "="}</span>
        <div class="coin-row-text">
          <p class="coin-row-name">${escapeHtml(item.name)}</p>
          <p class="coin-row-time">${escapeHtml(time)}</p>
        </div>
        <span class="coin-row-amount">${state.sign}${escapeHtml(Math.abs(Number(item.amount) || 0))}</span>
      </div>
    `
}

function dayLabel(value) {
    const date = parseApiDate(value)
    if (!date) return ""
    const today = new Date()
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return "Hoje"
    if (date.toDateString() === yesterday.toDateString()) return "Ontem"
    return diaPorExtenso(value)
}

function renderContaint(total, fetchPage, cardContaint, filter) {
    return paginate({
        total,
        container: cardContaint,
        fetchPage,
        renderItems: (parte) => {
            let previousDay = cardContaint.lastElementChild?.dataset.day ?? null

            return parte.map((item) => {
                const day = dayLabel(item.created_at)
                const separator = day !== previousDay
                    ? `<p class="coin-day">${escapeHtml(day)}</p>`
                    : ""
                previousDay = day
                return separator + coinRowHtml(item, day)
            }).join("")
        },
        pageSize: PAGE_SIZE,
        mode: "more",
        empty: `<div class="empty">${pixelIcon("coin", { size: 28 })}<p>${EMPTY_TEXT[filter ?? "all"]}</p></div>`,
    })
}
