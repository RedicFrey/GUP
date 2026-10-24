import { sideBar } from '../../../components/sidebar/sidebar.js'
import { taskChildSection } from './report_chart.js'
import { loadFamilyContext } from '../../../utils/family-context.js'
import { withoutChildren } from '../../../components/confirm-modal/confirm-modal.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { avatar } from '../../../components/avatar/avatar.js'
import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'

const reportContainer = document.querySelector("#report-container")
const chartFilter = document.querySelector('.chart-filters')
const chartDisplay = document.querySelector('.chart-display')
const chartInfo = document.querySelector('.chart-info')
const message = document.querySelector("#report-message")

const currentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}
const state = { childId: null, month: currentMonth() }

sideBar()

export async function report(ctx) {
    chartFilter.replaceChildren()
    state.childId = null

    if (ctx.isResponsible) {
        state.childId = ctx.children[0]?.id
        const childDiv = document.createElement("div")
        childDiv.className = "filter-child"
        chartFilter.append(childDiv)
        renderChildChips(childDiv, ctx.children)
    }

    const monthDiv = document.createElement("div")
    monthDiv.className = "filter-month"
    chartFilter.append(monthDiv)
    renderMonthSelect(monthDiv, loadReport)

    loadReport()
}

function renderChildChips(container, children) {
    container.innerHTML = `
        <div class="chip-row" role="group" aria-label="Escolher criança">
            ${children.map((c) => `
                <button type="button" class="chip" data-child-id="${escapeHtml(c.id)}">
                    ${avatar(c, { size: 28 })}${escapeHtml(c.name)}
                </button>`).join("")}
        </div>`

    const setActive = () => container.querySelectorAll(".chip").forEach((chip) => {
        const active = chip.dataset.childId === String(state.childId)
        chip.classList.toggle("ativo", active)
        chip.setAttribute("aria-pressed", String(active))
    })
    setActive()

    container.addEventListener("click", (event) => {
        const chip = event.target.closest(".chip")
        if (!chip) return
        state.childId = chip.dataset.childId
        setActive()
        loadReport()
    })
}

function renderMonthSelect(section, onChange) {
    section.innerHTML = `
        <label for="report-month">Mês</label>
        <input type="month" id="report-month" value="${state.month}" max="${currentMonth()}">
    `

    section.querySelector("#report-month").addEventListener("change", (event) => {
        if (!event.target.value) return
        state.month = event.target.value
        onChange()
    })
}

// ---------- API ----------
async function reportApi({ childProfileId, month }) {
    const params = new URLSearchParams()
    if (childProfileId) params.set("child_profile_id", childProfileId)
    if (month) params.set("month", month)

    const query = params.toString() ? `?${params}` : ""
    const { ok, status, dados } = await apiFetch(`/relatorios${query}`)

    if (status === 401) {
        goToLogin(dados?.erro)
        return null
    }

    if (!ok) {
        showMessage(message, dados?.erro || "Não foi possível carregar o relatório.", "erro")
        return null
    }

    message.className = "mensagem"
    message.textContent = ""
    return dados
}

async function loadReport() {
    try {
        const dados = await reportApi({ childProfileId: state.childId, month: state.month })
        taskChildSection(chartDisplay, dados, chartInfo)
    } catch (err) {
        console.error(err)
        showMessage(message, "Não foi possível montar o relatório.", "erro")
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const ctx = await loadFamilyContext()
    if (!ctx.profile) return

    if (ctx.isResponsible && !ctx.hasChildren) {
        const content = reportContainer.querySelector("#report-containt")
        content.innerHTML = ""
        withoutChildren(content)
        return
    }

    await report(ctx)
})
