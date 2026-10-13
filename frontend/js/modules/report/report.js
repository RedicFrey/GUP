

import { triggerPageFallback } from '../../generic/erro.js'
import { sideBar } from '../../generic/side_bar.js'
import { showChildrenTypeSelect } from '../../generic/list_children.js'
import { taskChildSection } from './report_chart.js'
import { familyChildren, loadMyProfile } from '../../generic/utils.js'
import { withoutChildren } from '../../generic/warning.js'

const reportContainer = document.querySelector("#report-container")

// "2026-10": mesmo formato que o <input type="month"> devolve e que o back espera
const currentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

// o que está escolhido nos filtros
const state = { childId: null, month: currentMonth() }


export async function report() {
    reportContainer.innerHTML = `
        <h2 class="title-page">Relatório</h2>
        <section id="report-containt">
            <section id="responsible-children-options"></section>
            <section id="report-month-options"></section>
            <p id="report-message"></p>
            <section id="report-child-task-graphic"></section>
            <section id="report-child-info"></section>
        </section>
    `

    const reportContaint = reportContainer.querySelector("#report-containt")

    // fazer uma função para substituir isso

    const childOptions = reportContainer.querySelector("#responsible-children-options")
    const monthOptions = reportContainer.querySelector("#report-month-options")

    // a criança é montada primeiro, porque ela define state.childId (a primeira já vem escolhida)
    await renderChildSelect(childOptions, loadReport)
    renderMonthSelect(monthOptions, loadReport)

    loadReport()
}


async function verifyChildren() {
    const profile = await loadMyProfile()
    if (profile?.profile_type !== "responsible") return true   // criança passa direto

    const children = (await familyChildren()) ?? []
    if (children.length === 0) {
        // o withoutChildren apaga o id e a classe do elemento que recebe,
        // então passa um filho do container e não o #report-container em si
        reportContainer.innerHTML = `
            <h2 class="title-page">Relatório</h2>
            <section id="report-without-children"></section>
        `
        withoutChildren(reportContainer.querySelector("#report-without-children"))
        return false
    }
    return true
}

// ---------- API ----------

// GET /relatorios?child_profile_id=5&month=2026-10
async function reportApi({ childProfileId, month }, messageElement) {
    const params = new URLSearchParams()
    if (childProfileId) params.set("child_profile_id", childProfileId)
    if (month) params.set("month", month)

    const query = params.toString() ? `?${params}` : ""
    const { ok, status, dados } = await apiFetch(`/relatorios${query}`)

    if (status === 401) {
        window.location.href = "auth.html"
        return null
    }

    if (!ok) {
        mostrarMensagem(messageElement, dados?.erro || "Erro ao carregar relatório.", "erro")
        return null
    }

    return dados
}

// Busca com o que está nos filtros e desenha. Roda de novo sempre que um filtro muda.
async function loadReport() {
    const message = reportContainer.querySelector("#report-message")
    const childInfo = reportContainer.querySelector("#report-child-info")
    const graphicSection = reportContainer.querySelector("#report-child-task-graphic")
    message.textContent = ""

    try {
        const dados = await reportApi(
            { childProfileId: state.childId, month: state.month },
            message
        )

        if (!dados) {
            childInfo.innerHTML = ""
            taskChildSection(graphicSection, null)     // limpa o gráfico
            return
        }

        taskChildSection(graphicSection, dados) 
    } catch (err) {
        console.error(err)
        triggerPageFallback(reportContainer.querySelector("#report-containt"))
    }
}

async function renderChildSelect(section, onChange) {
    const select = document.createElement("select")
    select.id = "report-child"

    // monta as <option>; o onChange recebe o id da criança escolhida
    await showChildrenTypeSelect(select, {
        onChange: (childId) => {
            state.childId = childId
            onChange()
        },
    })

    // sem lista de crianças (ex.: perfil de criança): não mostra o select
    if (select.options.length === 0) {
        section.innerHTML = ""
        return
    }

    state.childId = select.value    // a primeira criança já vem selecionada

    section.innerHTML = `<h3>Relatório de:</h3>`
    section.append(select)
}

function renderMonthSelect(section, onChange) {
    section.innerHTML = `
        <label for="report-month">Mês:</label>
        <input type="month" id="report-month" value="${state.month}">
    `

    section.querySelector("#report-month").addEventListener("change", (event) => {
        if (!event.target.value) return      // o usuário limpou o campo
        state.month = event.target.value
        onChange()
    })
}




document.addEventListener("DOMContentLoaded", async () => {
    sideBar()
    if (!(await verifyChildren())) return
    await report()
})

