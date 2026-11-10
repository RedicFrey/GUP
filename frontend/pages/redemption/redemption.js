// ============================================================
// redemption.js -> página "Resgates"
// ============================================================
// Resgate = uma recompensa que a criança já trocou por moedas.
// O responsável marca quando entregou (ou desfaz).

import { api } from "../../services/api.js"
import { meuPerfil, botoesDasCriancas } from "../../services/perfil.js"
import { escapeHtml, dataHora } from "../../utils/formatar.js"

const lista = document.querySelector("#lista")
const perfil = await meuPerfil()
const responsavel = perfil?.profile_type === "responsible"
let criancaId = ""


// Botão de cada resgate (só o responsável vê)
function botao(resgate) {
    if (!responsavel) return ""
    return resgate.status === "done"
        ? `<button type="button" class="btn btn-sm btn-ghost" data-id="${resgate.id}" data-status="done">Desfazer</button>`
        : `<button type="button" class="btn btn-sm btn-success" data-id="${resgate.id}" data-status="pending">Marcar como entregue</button>`
}

// GET /resgates_feitos/?crianca_id=..&por_pagina=50 -> { dados: [...] }
async function carregarResgates() {
    const resposta = await api(`/resgates_feitos/?crianca_id=${criancaId}&pagina=1&por_pagina=50`)
    if (!resposta) return

    if (resposta.dados.length === 0) {
        lista.innerHTML = `<li class="empty"><i class="icone icone-g i-ticket"></i><p>Nenhuma recompensa foi trocada ainda.</p></li>`
        return
    }

    lista.innerHTML = resposta.dados.map((resgate) => `
        <li class="resgates-realizados ${resgate.status === "done" ? "is-done" : ""}">
            <span class="redemption-icon"><i class="icone i-gift"></i></span>
            <div class="redemption-text">
                <p class="nome-resgate">${escapeHtml(resgate.name)}</p>
                <p class="horario-resgate">${dataHora(resgate.created_at)}</p>
            </div>
            <span class="valor-resgate coin-amount"><img class="moeda" src="../../assets/icons/coin-color.svg" alt="">${resgate.amount}</span>
            <div class="redemption-status">
                ${resgate.status === "done" ? `<span class="tag tag-done">Entregue</span>` : `<span class="tag tag-awaiting">Falta entregar</span>`}
                ${botao(resgate)}
            </div>
        </li>`).join("")
}

// PUT /resgates_feitos/confirmar com { id, status atual } -> o backend inverte o status
lista.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button")
    if (!botao) return
    botao.disabled = true
    const mudou = await api("/resgates_feitos/confirmar", {
        method: "PUT",
        body: { id: Number(botao.dataset.id), status: botao.dataset.status },
    })
    if (mudou) carregarResgates()
})

// responsável escolhe a criança; a criança vê os dela direto
if (responsavel) {
    botoesDasCriancas((id) => {
        criancaId = id
        carregarResgates()
    })
} else if (perfil) {
    carregarResgates()
}
