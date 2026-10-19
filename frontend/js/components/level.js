
// apiFetch é o global do projeto (js/api.js)

const ITEM_LABELS = {
    color: "Cor",
    background: "Fundo",
    accessory: "Acessório",
}

import { loadMyProfile } from '../generic/utils.js'

export async function checkLevelUp() {
    const response = await loadMyProfile()

    if (response.profile_type !== "child") return

    try {
        const pending = await pendingLevelApi()
        if (!pending?.pending) return

        showLevelUpDialog(pending)
    } catch (err) {
        // essa tela é um extra: se falhar, não pode quebrar o dashboard
        console.error(err)
    }
}

function showLevelUpDialog({ from_level, to_level, unlocked_items }) {
    const dialog = document.createElement("dialog")
    dialog.id = "level-up-dialog"

    const title = document.createElement("h2")
    title.textContent = `Você chegou ao nível ${to_level}!`

    const subtitle = document.createElement("p")
    subtitle.textContent = to_level - from_level > 1
        ? `Você subiu do nível ${from_level} para o ${to_level}.`
        : "Parabéns pelo seu esforço!"

    dialog.append(title, subtitle)

    if (unlocked_items?.length) {
        const heading = document.createElement("h3")
        heading.textContent = "Novidades desbloqueadas"

        const list = document.createElement("ul")
        unlocked_items.forEach((item) => list.append(renderItem(item)))

        dialog.append(heading, list)
    }

    const closeBtn = document.createElement("button")
    closeBtn.type = "button"
    closeBtn.textContent = "Continuar"
    closeBtn.addEventListener("click", () => dialog.close())
    dialog.append(closeBtn)

    // "close" dispara pelo botão e também pelo Esc, então cobre os dois jeitos de fechar
    dialog.addEventListener("close", () => {
        dialog.remove()
        levelSeenApi(to_level)
    })

    document.body.append(dialog)
    dialog.showModal()
}

function renderItem(item) {
    const li = document.createElement("li")

    const label = document.createElement("strong")
    label.textContent = `${ITEM_LABELS[item.type] ?? "Item"}: `
    li.append(label)

    if (item.type === "color") {
        li.append(`${item.primary_color} e ${item.secondary_color}`)
    } else {
        const img = document.createElement("img")
        img.src = item.image_url
        img.alt = item.name
        img.width = 48
        li.append(img, ` ${item.name}`)
    }

    return li
}


// ---------- API ----------

async function pendingLevelApi() {
    const { ok, status, dados } = await apiFetch("/niveis/pendente")

    if (status === 401) {
        window.location.href = "auth.html"
        return null
    }

    if (!ok) return null

    return dados
}

async function levelSeenApi(level) {
    try {
        await apiFetch("/niveis/visto", { method: "POST", body: { level } })
    } catch (err) {
        console.error(err)     // se falhar, a tela só aparece de novo no próximo carregamento
    }
}
