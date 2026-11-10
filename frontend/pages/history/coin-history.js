// ============================================================
// coin-history.js -> página "Moedas" (saldo + extrato)
// ============================================================
// - criança: vê a própria carteira
// - responsável: escolhe a criança e pode dar ou tirar moedas

import { api } from "../../services/api.js"
import { meuPerfil, botoesDasCriancas, avatar } from "../../services/perfil.js"
import { escapeHtml, dataHora } from "../../utils/formatar.js"

const extrato = document.querySelector("#extrato")
const dialogo = document.querySelector("#dialogo-ajuste")
const perfil = await meuPerfil()

let criancaId = ""   // responsável: qual criança está vendo
let tipo = ""        // "" = tudo, "credit" = entradas, "debit" = saídas


// GET /historicos/?child_id=..&filter=..&size=50 -> { child: {...}, history: [...] }
async function carregarExtrato() {
    const resposta = await api(`/historicos/?child_id=${criancaId}&filter=${tipo}&page=1&size=50`)
    if (!resposta) return

    // saldo
    const crianca = resposta.child
    document.querySelector("#saldo-avatar").innerHTML = avatar(crianca, "avatar-g")
    document.querySelector("#saldo-valor").textContent = crianca.coins
    if (perfil.profile_type === "responsible") document.querySelector("#saldo-dono").textContent = `Carteira de ${crianca.name}`

    // extrato: uma linha por movimentação (+15 verde ou −40 vermelho)
    if (resposta.history.length === 0) {
        extrato.innerHTML = `<div class="empty"><i class="icone icone-g i-coin"></i><p>Nenhuma movimentação ainda.</p></div>`
        return
    }
    extrato.innerHTML = resposta.history.map((item) => {
        const entrou = item.amount_type === "credit"
        const sinal = entrou ? "+" : "−"
        return `
            <div class="coin-row ${entrou ? "coin-credit" : "coin-debit"}">
                <span class="coin-badge">${sinal}</span>
                <div>
                    <p class="coin-row-name">${escapeHtml(item.name)}</p>
                    <p class="coin-row-time">${dataHora(item.created_at)}</p>
                </div>
                <span class="coin-row-amount">${sinal}${item.amount}</span>
            </div>`
    }).join("")
}

// Filtro Tudo / Entradas / Saídas
document.querySelector("#filtro-tipo").addEventListener("click", (evento) => {
    const botao = evento.target.closest("button")
    if (!botao) return
    document.querySelectorAll("#filtro-tipo button").forEach((b) => b.classList.remove("active"))
    botao.classList.add("active")
    tipo = botao.dataset.tipo
    carregarExtrato()
})


// Ajustar moedas (responsável)
document.querySelector("#ajustar").addEventListener("click", () => dialogo.showModal())

// POST /historicos/ajustar/<id_da_crianca> com { type: "add" | "remove", amount, reason }
document.querySelector("#form-ajuste").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const salvou = await api(`/historicos/ajustar/${criancaId}`, {
        method: "POST",
        body: {
            type: document.querySelector('input[name="tipo"]:checked').value,
            amount: Number(document.querySelector("#quantidade").value),
            reason: document.querySelector("#motivo").value.trim(),
        },
        mensagem: document.querySelector("#ajuste-mensagem"),
    })
    if (!salvou) return
    dialogo.close()
    document.querySelector("#form-ajuste").reset()
    carregarExtrato()
})


// responsável escolhe a criança; a criança vê a dela direto
if (perfil?.profile_type === "responsible") {
    botoesDasCriancas((id) => {
        criancaId = id
        carregarExtrato()
    })
} else if (perfil) {
    carregarExtrato()
}
