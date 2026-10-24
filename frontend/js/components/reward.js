// apiFetch e mostrarMensagem são os globais do projeto (js/api.js)

let buying = false      // evita compra dupla se a função rodar duas vezes ao mesmo tempo

export async function childGoal(section, { autoBuy = true, notice = "" } = {}) {
    const message = document.createElement("p")
    section.replaceChildren(message)
    if (notice) message.textContent = notice

    try {
        const goal = await goalApi(message)
        if (!goal) return          // deu erro: a mensagem já está na tela

        // sem meta escolhida, os campos da recompensa vêm null
        if (!goal.reward_id) {
            const empty = document.createElement("p")
            empty.textContent = "Você ainda não escolheu uma meta."
            section.append(empty)
            return
        }

        renderGoal(section, goal, message)

        // moedas suficientes: compra sozinho, uma única tentativa
        if (autoBuy && goal.child_coins >= goal.reward_amount) {
            const bought = await buyGoalApi(goal.reward_id, message)
            if (bought) {
                // redesenha com os dados novos, sem tentar comprar de novo
                await childGoal(section, {
                    autoBuy: false,
                    notice: `Parabéns! Você comprou "${goal.reward_name}".`,
                })
            }
        }
    } catch (err) {
        console.error(err)
        mostrarMensagem(message, "Erro ao carregar a meta.", "erro")
    }
}

export async function removeGoal(section, message, button) {
    message.textContent = ""
    button.disabled = true

    const removed = await removeGoalApi(message)
    if (!removed) {
        button.disabled = false
        return
    }

    await childGoal(section)       // sem meta, mostra "Você ainda não escolheu uma meta."
}


// ---------- Desenho ----------

function renderGoal(section, goal, message) {
    const card = document.createElement("div")
    card.className = "meta-card"

    const title = document.createElement("h3")
    title.textContent = "Minha meta"

    const name = document.createElement("p")
    const nameStrong = document.createElement("strong")
    nameStrong.textContent = goal.reward_name
    name.append(nameStrong)

    const price = document.createElement("p")
    price.textContent = `Valor da recompensa: ${goal.reward_amount} moedas`

    const coins = document.createElement("p")
    coins.textContent = `Suas moedas: ${goal.child_coins}`

    const progress = document.createElement("progress")
    progress.max = goal.reward_amount
    progress.value = Math.min(goal.child_coins, goal.reward_amount)

    const removeBtn = document.createElement("button")
    removeBtn.type = "button"
    removeBtn.textContent = "Remover meta"
    removeBtn.addEventListener("click", () => removeGoal(section, message, removeBtn))

    card.append(title, name, price, coins, progress, removeBtn)
    section.append(card)
}


// ---------- API ----------

async function goalApi(message) {
    const { ok, status, dados } = await apiFetch("/recompensas/meta")

    if (status === 401) {
        window.location.href = "auth.html"
        return null
    }

    if (!ok) {
        mostrarMensagem(message, dados?.erro || "Erro ao carregar a meta.", "erro")
        return null
    }

    return dados
}

async function buyGoalApi(rewardId, message) {
    if (buying) return false
    buying = true

    try {
        const { ok, status, dados } = await apiFetch(`/recompensas/comprar/${rewardId}`, { method: "POST" })

        if (status === 401) {
            window.location.href = "auth.html"
            return false
        }

        if (!ok) {
            mostrarMensagem(message, dados?.erro || "Erro ao comprar a recompensa.", "erro")
            return false
        }

        return true
    } finally {
        buying = false
    }
}

async function removeGoalApi(message) {
    const { ok, status, dados } = await apiFetch("/recompensas/meta", { method: "DELETE" })

    if (status === 401) {
        window.location.href = "auth.html"
        return false
    }

    if (!ok) {
        mostrarMensagem(message, dados?.erro || "Erro ao remover a meta.", "erro")
        return false
    }

    return true
}