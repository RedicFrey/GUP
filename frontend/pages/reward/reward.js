// ============================================================
// reward.js -> página "Recompensas" (a lojinha da família)
// ============================================================
// - responsável: cria e exclui recompensas
// - criança: troca moedas pela recompensa ou escolhe ela como meta

import { api, mostrarMensagem } from "../../services/api.js"
import { escapeHtml } from "../../utils/formatar.js"

const lista = document.querySelector("#lista")
const dialogo = document.querySelector("#dialogo-recompensa")


// GET /recompensas/ -> { rewards: [...], auth_child: {...} | null }
// auth_child só vem preenchido quando quem está logado é criança
async function carregarRecompensas() {
    const dados = await api("/recompensas/")
    if (!dados) return
    const crianca = dados.auth_child
    if (crianca) document.querySelector("#carteira").textContent = crianca.coins

    if (dados.rewards.length === 0) {
        lista.innerHTML = `<li class="empty"><i class="icone icone-g i-gift"></i><p>Ainda não há recompensas.</p></li>`
        return
    }

    // da mais barata para a mais cara
    dados.rewards.sort((a, b) => a.amount - b.amount)

    lista.innerHTML = dados.rewards.map((recompensa) => `
        <li class="reward-card ${crianca?.goal_id === recompensa.id ? "is-goal" : ""}">
            <span class="reward-gift"><i class="icone i-gift"></i></span>
            <h2 class="reward-name">${escapeHtml(recompensa.name)}</h2>
            <p class="reward-price coin-amount"><img class="moeda" src="../../assets/icons/coin-color.svg" alt="">${recompensa.amount}</p>
            <div class="acoes">${crianca ? botoesDaCrianca(recompensa, crianca) : botaoDoResponsavel(recompensa)}</div>
        </li>`).join("")
}

function botaoDoResponsavel(recompensa) {
    return `<button type="button" class="btn btn-sm btn-ghost" data-acao="excluir" data-id="${recompensa.id}"><i class="icone i-trash"></i> Excluir</button>`
}

function botoesDaCrianca(recompensa, crianca) {
    // tem moedas suficientes: pode trocar agora
    if (crianca.coins >= recompensa.amount) {
        return `<button type="button" class="btn-primary" data-acao="comprar" data-id="${recompensa.id}">Trocar agora</button>`
    }
    // não tem: mostra quanto falta e o botão de meta
    const porcentagem = Math.round((crianca.coins / recompensa.amount) * 100)
    const meta = crianca.goal_id === recompensa.id
        ? `<p class="reward-goal-tag"><i class="icone i-flag"></i> Sua meta</p>`
        : `<button type="button" class="btn btn-sm" data-acao="meta" data-id="${recompensa.id}">Virar minha meta</button>`
    return `
        <div class="progress"><span style="width:${porcentagem}%"></span></div>
        <p class="reward-missing">Faltam ${recompensa.amount - crianca.coins} moedas</p>
        ${meta}`
}


// Um clique só na lista: o botão diz qual ação (data-acao) e qual recompensa (data-id)
lista.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("[data-acao]")
    if (!botao) return
    const { acao, id } = botao.dataset

    // DELETE /recompensas/deletar/<id>
    if (acao === "excluir" && confirm("Excluir esta recompensa?")) {
        if (await api(`/recompensas/deletar/${id}`, { method: "DELETE" })) carregarRecompensas()
    }

    // POST /recompensas/definir-meta/<id>
    if (acao === "meta") {
        if (await api(`/recompensas/definir-meta/${id}`, { method: "POST" })) carregarRecompensas()
    }

    // POST /recompensas/comprar/<id> -> a resposta é a criança com o saldo novo
    if (acao === "comprar") {
        const crianca = await api(`/recompensas/comprar/${id}`, { method: "POST" })
        if (!crianca) return
        document.querySelector("#menu-moedas").textContent = crianca.coins   // atualiza as moedas do menu
        mostrarMensagem(document.querySelector("#mensagem"), "Pronto! A recompensa foi para os seus resgates. Avise um responsável.", "sucesso")
        carregarRecompensas()
    }
})


// Nova recompensa: abre a janelinha
document.querySelector("#nova").addEventListener("click", () => dialogo.showModal())

// POST /recompensas/criar com { name, amount }
document.querySelector("#form-recompensa").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const criou = await api("/recompensas/criar", {
        method: "POST",
        body: {
            name: document.querySelector("#nome").value.trim(),
            amount: Number(document.querySelector("#preco").value),
        },
        mensagem: document.querySelector("#recompensa-mensagem"),
    })
    if (!criou) return
    dialogo.close()
    document.querySelector("#form-recompensa").reset()
    carregarRecompensas()
})

carregarRecompensas()
