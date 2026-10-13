import { escapeHtml } from '../../generic/utils.js'
import { ICONS } from '../../generic/icons.js'
import { paginate } from '../../generic/pagination.js'   // ajuste o caminho se for outro

// quantos itens por vez (o coin_history.js usa o mesmo valor ao buscar a primeira página)
export const PAGE_SIZE = 10

// fetchPage(page, size) busca uma página no back; data.total vem do COUNT(*)
export async function renderCardCoin(data, container, fetchPage) {
    container.innerHTML = `
        <h3>Extrato de: ${escapeHtml(data.child.name)} (Saldo: ${escapeHtml(data.child.coins)} moedas)</h3>
        <div id="card-containt" class="coin-list"></div>
    `

    const cardContaint = container.querySelector("#card-containt")
    await renderContaint(data.total, fetchPage, cardContaint)
}

const coinRowHtml = (item, day) => {
    const state = getCoinState(item.amount_type, item.amount)
    return `
      <div class="coin-row ${state.className}" data-day="${escapeHtml(day)}">
        <div class="coin-badge">
          ${state.icon}
          <span>${state.sign}${item.amount}</span>
        </div>
        <div>
          <div>${escapeHtml(item.name)}</div>
          <div>${formatarDataEHorario(item.created_at)}</div>
        </div>
      </div>
    `
}

const dayLabel = (value) => {
    const date = new Date(value)
    return isNaN(date)
        ? ""
        : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

function renderContaint(total, fetchPage, cardContaint) {
    return paginate({
        total,
        container: cardContaint,
        fetchPage,
        renderItems: (parte) => {
            // a lista chega em blocos (modo "more"): o dia anterior é o da última linha
            // que já está na tela, para não repetir o título do dia na emenda dos blocos
            let previousDay = cardContaint.lastElementChild?.dataset.day ?? null

            return parte.map((item) => {
                const day = dayLabel(item.created_at)
                const separator = day !== previousDay
                    ? `<p class="coin-day">${day}</p>`
                    : ""
                previousDay = day
                return separator + coinRowHtml(item, day)
            }).join("")
        },
        pageSize: PAGE_SIZE,
        mode: "more",
        empty: "<p>Nenhuma movimentação registrada ainda.</p>",
    })
}

function getCoinState(amountType, amount) {
  if (Number(amount) === 0) return ICONS.coin_history.zero
  return amountType === "credit" ? ICONS.coin_history.credit : ICONS.coin_history.debit
}
