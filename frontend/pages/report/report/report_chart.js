import { escapeHtml } from '../../../utils/escape-html.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'

// Cada status tem uma cor fixa (as mesmas das etiquetas no resto do app)
const ITEMS = [
    { key: "done", label: "Feitas no prazo", className: "rb-done" },
    { key: "done_late", label: "Feitas com atraso", className: "rb-late" },
    { key: "not_done", label: "Não feitas", className: "rb-missed" },
    { key: "open", label: "Em andamento", className: "rb-open" },
]

const MONTH_NAMES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro"]

function monthLabel(month) {
    const [year, m] = String(month ?? "").split("-").map(Number)
    return MONTH_NAMES[m - 1] ? `${MONTH_NAMES[m - 1]} de ${year}` : ""
}

// Gráfico em blocos: um quadradinho por tarefa, pintado pelo status
export function taskChildSection(section, dados, infoSection = null) {
    section.replaceChildren()
    infoSection?.replaceChildren()

    if (!dados) return

    const values = ITEMS.map((item) => Number(dados[item.key]) || 0)
    const total = Number(dados.total) || values.reduce((a, b) => a + b, 0)
    const name = dados.child?.name ?? ""

    if (total === 0) {
        section.innerHTML = `
            <div class="empty">
                ${pixelIcon("chart", { size: 28 })}
                <p>${escapeHtml(name)} não teve tarefas em ${escapeHtml(monthLabel(dados.month))}.</p>
            </div>`
        return
    }

    const doneAll = values[0] + values[1]
    const percent = Math.round((doneAll / total) * 100)

    const blocks = ITEMS.flatMap((item, i) =>
        Array.from({ length: values[i] }, () => `<span class="report-block ${item.className}"></span>`)
    ).join("")

    section.innerHTML = `
        <div class="report-headline">
            <p class="report-percent">${percent}%</p>
            <p class="report-percent-text">
                das tarefas de ${escapeHtml(name)} em ${escapeHtml(monthLabel(dados.month))} foram feitas
                <span>(${doneAll} de ${total})</span>
            </p>
        </div>
        <div class="report-blocks" role="img"
            aria-label="${ITEMS.map((item, i) => `${item.label}: ${values[i]}`).join(", ")}">${blocks}</div>
        <p class="report-hint">Cada quadradinho é uma tarefa do mês.</p>
    `

    const list = document.createElement("ul")
    list.className = "report-values"
    list.innerHTML = ITEMS.map((item, i) => `
        <li>
            <span class="report-dot ${item.className}"></span>
            <span class="report-label">${item.label}</span>
            <strong>${values[i]}</strong>
        </li>
    `).join("") + `
        <li class="report-total">
            <span class="report-label">Total no mês</span>
            <strong>${total}</strong>
        </li>`

    ;(infoSection ?? section).append(list)
}
