import { apiFetch, showMessage, goToLogin, pageUrl } from '../../services/api.js'
import { escapeHtml } from '../../utils/escape-html.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'

const REWARD_PAGE = pageUrl("pages/reward/reward.html")

let buying = false      // evita compra dupla se a função rodar duas vezes ao mesmo tempo

// onCoinsChange(novoSaldo) é chamado depois de uma compra automática
export async function childGoal(section, { autoBuy = true, notice = "", onCoinsChange } = {}) {
    section.classList.add("goal-card")
    section.innerHTML = `<p class="loading">Carregando sua meta…</p>`

    const message = document.createElement("p")
    message.className = "mensagem"

    try {
        const goal = await goalApi(message)
        if (!goal) {
            section.replaceChildren(message)
            return
        }

        // sem meta escolhida, os campos da recompensa vêm null
        if (!goal.reward_id) {
            renderEmpty(section, notice)
            return
        }

        renderGoal(section, goal, message, notice, onCoinsChange)

        // moedas suficientes: compra sozinho, uma única tentativa
        if (autoBuy && goal.child_coins >= goal.reward_amount) {
            const bought = await buyGoalApi(goal.reward_id, message)
            if (bought) {
                onCoinsChange?.(bought.coins)
                // redesenha com os dados novos, sem tentar comprar de novo
                await childGoal(section, {
                    autoBuy: false,
                    notice: `Você juntou o suficiente e ganhou "${goal.reward_name}"! Peça para um responsável entregar.`,
                    onCoinsChange,
                })
            }
        }
    } catch (err) {
        console.error(err)
        section.replaceChildren(message)
        showMessage(message, "Não foi possível carregar a meta. Atualize a página para tentar de novo.", "erro")
    }
}

export async function removeGoal(section, message, button, options) {
    message.textContent = ""
    button.disabled = true

    const removed = await removeGoalApi(message)
    if (!removed) {
        button.disabled = false
        return
    }

    await childGoal(section, options)
}


// ---------- Desenho ----------

function headHtml() {
    return `
        <div class="goal-head">
            <span class="goal-icon">${pixelIcon("flag", { size: 18 })}</span>
            <h2 class="goal-label">Minha meta</h2>
        </div>`
}

function renderEmpty(section, notice) {
    section.innerHTML = `
        ${headHtml()}
        ${notice ? `<p class="mensagem sucesso"></p>` : ""}
        <p class="goal-empty">Escolha uma recompensa para juntar moedas até ela.</p>
        <a class="btn btn-sm" href="${REWARD_PAGE}">Escolher uma meta</a>
    `
    if (notice) section.querySelector(".mensagem").textContent = notice
}

function renderGoal(section, goal, message, notice, onCoinsChange) {
    const amount = Number(goal.reward_amount) || 0
    const coins = Number(goal.child_coins) || 0
    const percent = amount ? Math.min(100, Math.round((coins / amount) * 100)) : 0
    const missing = Math.max(0, amount - coins)

    section.innerHTML = `
        ${headHtml()}
        <p class="goal-name">${escapeHtml(goal.reward_name)}</p>
        <div class="progress" role="progressbar" aria-label="Moedas juntadas para a meta"
            aria-valuemin="0" aria-valuemax="${amount}" aria-valuenow="${Math.min(coins, amount)}">
            <span style="--value:${percent}%"></span>
        </div>
        <p class="goal-numbers">
            <span class="coin-amount">${pixelIcon("coinColor", { size: 14 })}${coins} de ${amount}</span>
            <span class="goal-missing">${missing ? `faltam ${missing}` : "meta alcançada"}</span>
        </p>
        <div class="goal-actions">
            <a class="btn btn-sm btn-ghost" href="${REWARD_PAGE}">Trocar meta</a>
            <button type="button" class="btn btn-sm btn-ghost goal-remove">Remover</button>
        </div>
    `

    if (notice) {
        const ok = document.createElement("p")
        ok.className = "mensagem sucesso"
        ok.textContent = notice
        section.querySelector(".goal-head").after(ok)
    }
    section.append(message)

    const removeBtn = section.querySelector(".goal-remove")
    removeBtn.addEventListener("click", () => removeGoal(section, message, removeBtn, { onCoinsChange }))
}


// ---------- API ----------

async function goalApi(message) {
    const { ok, status, dados } = await apiFetch("/recompensas/meta")

    if (status === 401) {
        goToLogin(dados?.erro)
        return null
    }

    if (!ok) {
        showMessage(message, dados?.erro || "Erro ao carregar a meta.", "erro")
        return null
    }

    return dados
}

// devolve a criança atualizada (com o saldo novo) ou null
async function buyGoalApi(rewardId, message) {
    if (buying) return null
    buying = true

    try {
        const { ok, status, dados } = await apiFetch(`/recompensas/comprar/${rewardId}`, { method: "POST" })

        if (status === 401) {
            goToLogin(dados?.erro)
            return null
        }

        if (!ok) {
            showMessage(message, dados?.erro || "Erro ao comprar a recompensa.", "erro")
            return null
        }

        return dados ?? {}
    } finally {
        buying = false
    }
}

async function removeGoalApi(message) {
    const { ok, status, dados } = await apiFetch("/recompensas/meta", { method: "DELETE" })

    if (status === 401) {
        goToLogin(dados?.erro)
        return false
    }

    if (!ok) {
        showMessage(message, dados?.erro || "Erro ao remover a meta.", "erro")
        return false
    }

    return true
}
