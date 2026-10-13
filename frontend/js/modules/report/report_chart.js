// Chart vem do <script> do CDN no HTML (variável global)

const estiloGlobal = getComputedStyle(document.documentElement)
const corPrimaria = estiloGlobal.getPropertyValue('--color-primary').trim() || '#4C5BFF'      // Azul
const corSecundaria = estiloGlobal.getPropertyValue('--color-secondary').trim() || '#9676F4'  // Roxo
const corAlternativa = '#FF4C4C'                                                              // Vermelho
const corNeutra = '#8A94A6'                                                                   // Cinza

// Um item por campo que a API devolve. A ordem daqui é a ordem das fatias e da lista.
const ITEMS = [
    { key: "done",      label: "Concluídas no prazo",   color: corPrimaria },
    { key: "done_late", label: "Concluídas com atraso", color: corSecundaria },
    { key: "not_done",  label: "Não feitas",            color: corAlternativa },
    { key: "open",      label: "Em andamento",          color: corNeutra },
]

// instância atual do gráfico: precisa ser destruída antes de criar outra (troca de mês ou criança)
let chart = null

function destroyChart() {
    if (chart) {
        chart.destroy()
        chart = null
    }
}

// section: a <section> do gráfico. dados: o JSON do /relatorios (ou null para limpar).
export function taskChildSection(section, dados) {
    destroyChart()
    section.replaceChildren()

    if (!dados) return

    const values = ITEMS.map((item) => Number(dados[item.key]) || 0)
    const total = Number(dados.total) || values.reduce((a, b) => a + b, 0)

    if (total === 0) {
        section.innerHTML = "<p>Nenhuma tarefa neste mês.</p>"
        return
    }

    // div do gráfico, com o canvas dentro
    const graphicDiv = document.createElement("div")
    graphicDiv.className = "report-chart"
    const canvas = document.createElement("canvas")
    graphicDiv.append(canvas)

    // valores de cada item, embaixo do gráfico
    const list = document.createElement("ul")
    list.className = "report-values"
    list.innerHTML = ITEMS.map((item, i) => `
        <li>
            <span class="report-dot" style="background:${item.color}"></span>
            ${item.label}: <strong>${values[i]}</strong>
        </li>
    `).join("") + `<li>Total: <strong>${total}</strong></li>`

    section.append(graphicDiv, list)

    chart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ITEMS.map((item) => item.label),
            datasets: [{
                label: 'Status das tarefas',
                data: values,
                backgroundColor: ITEMS.map((item) => item.color),
                borderWidth: 2,
                borderColor: '#171F2D',     // cor da separação entre as fatias
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFFFFF',
                        font: { size: 14 },
                    },
                },
            },
        },
    })
}