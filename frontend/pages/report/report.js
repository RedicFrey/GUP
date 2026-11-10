// ============================================================
// report.js -> página "Relatório" do mês
// ============================================================
// O gráfico é feito de quadradinhos: CADA QUADRADINHO É UMA TAREFA,
// pintado pela situação dela (verde = feita, amarelo = feita atrasada...).
// Assim não precisa de biblioteca de gráfico nenhuma.

import { api } from "../../services/api.js"
import { meuPerfil, botoesDasCriancas } from "../../services/perfil.js"
import { escapeHtml } from "../../utils/formatar.js"

const grafico = document.querySelector("#grafico")
const numeros = document.querySelector("#numeros")
const campoMes = document.querySelector("#mes")

// cada pedaço do relatório: o campo da API, o nome e a cor (classe CSS)
const PARTES = [
    { campo: "done", nome: "Feitas no prazo", cor: "rb-done" },
    { campo: "done_late", nome: "Feitas com atraso", cor: "rb-late" },
    { campo: "not_done", nome: "Não feitas", cor: "rb-missed" },
    { campo: "open", nome: "Em andamento", cor: "rb-open" },
]

let criancaId = ""


// GET /relatorios?child_profile_id=..&month=2026-10
// -> { child: {name}, total, done, done_late, not_done, open }
async function carregarRelatorio() {
    const dados = await api(`/relatorios?child_profile_id=${criancaId}&month=${campoMes.value}`)
    if (!dados) return

    if (dados.total === 0) {
        grafico.innerHTML = `<div class="empty"><i class="icone icone-g i-chart"></i><p>${escapeHtml(dados.child.name)} não teve tarefas nesse mês.</p></div>`
        numeros.innerHTML = ""
        return
    }

    const feitas = dados.done + dados.done_late
    const porcentagem = Math.round((feitas / dados.total) * 100)

    // um <span> para cada tarefa: se "done" é 8, são 8 quadradinhos verdes
    let quadradinhos = ""
    for (const parte of PARTES) {
        quadradinhos += `<span class="report-block ${parte.cor}"></span>`.repeat(dados[parte.campo])
    }

    grafico.innerHTML = `
        <div class="report-headline">
            <p class="report-percent">${porcentagem}%</p>
            <p class="report-percent-text">das tarefas de ${escapeHtml(dados.child.name)} foram feitas (${feitas} de ${dados.total})</p>
        </div>
        <div class="report-blocks">${quadradinhos}</div>
        <p class="report-hint">Cada quadradinho é uma tarefa do mês.</p>`

    numeros.innerHTML = PARTES.map((parte) => `
        <li><span class="report-dot ${parte.cor}"></span><span>${parte.nome}</span><strong>${dados[parte.campo]}</strong></li>
    `).join("") + `<li class="report-total"><span>Total no mês</span><strong>${dados.total}</strong></li>`
}


// o campo de mês começa no mês atual, no formato "2026-11"
// (getMonth começa no 0, por isso o +1; padStart coloca o zero: "5" -> "05")
const hoje = new Date()
campoMes.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`
campoMes.addEventListener("change", carregarRelatorio)

const perfil = await meuPerfil()
if (perfil?.profile_type === "responsible") {
    botoesDasCriancas((id) => {
        criancaId = id
        carregarRelatorio()
    })
} else if (perfil) {
    carregarRelatorio()
}
