import { apiFetch, assetUrl, goToLogin, pageUrl } from '../../services/api.js'
import { loadMyProfile } from '../../services/perfil-service.js'
import { escapeHtml } from '../../utils/escape-html.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'

const ITEM_LABELS = {
    color: "Cor nova",
    background: "Cenário novo",
    accessory: "Acessório novo",
}

const CUSTOM_PAGE = pageUrl("pages/setting/custom.html")

// profile (opcional): se a página já carregou o perfil, não busca de novo
export async function checkLevelUp(profile = null) {
    const me = profile ?? await loadMyProfile()
    if (me?.profile_type !== "child") return

    try {
        const pending = await pendingLevelApi()
        if (!pending?.pending) return

        showLevelUpDialog(pending)
    } catch (err) {
        // essa tela é um extra: se falhar, não pode quebrar o perfil
        console.error(err)
    }
}

function showLevelUpDialog({ from_level, to_level, unlocked_items }) {
    const dialog = document.createElement("dialog")
    dialog.id = "level-up-dialog"

    const subtitle = to_level - from_level > 1
        ? `Você pulou do nível ${from_level} direto para o ${to_level}.`
        : "Suas tarefas renderam XP suficiente para subir de nível."

    const items = unlocked_items?.length ? `
        <h3 class="level-up-heading">Desbloqueado para a sua girafa</h3>
        <ul class="level-up-items">${unlocked_items.map(renderItem).join("")}</ul>
    ` : ""

    dialog.innerHTML = `
        <div class="level-up-badge" aria-hidden="true">
            <span>${escapeHtml(to_level)}</span>
        </div>
        <h2 class="level-up-title">Nível ${escapeHtml(to_level)}!</h2>
        <p class="level-up-sub">${escapeHtml(subtitle)}</p>
        ${items}
        <div class="dialog-actions">
            ${unlocked_items?.length ? `<a class="btn" href="${CUSTOM_PAGE}">Personalizar girafa</a>` : ""}
            <button type="button" class="btn-primary level-up-close" autofocus>Continuar</button>
        </div>
    `

    dialog.querySelector(".level-up-close").addEventListener("click", () => dialog.close())

    // "close" dispara pelo botão e também pelo Esc, então cobre os dois jeitos de fechar
    dialog.addEventListener("close", () => {
        dialog.remove()
        levelSeenApi(to_level)
    })

    document.body.append(dialog)
    dialog.showModal()
}

function renderItem(item) {
    const label = ITEM_LABELS[item.type] ?? "Item novo"
    const img = item.image_url
        ? `<img src="${escapeHtml(assetUrl(item.image_url))}" alt="" class="level-up-thumb level-up-thumb-${escapeHtml(item.type)}">`
        : `<span class="level-up-thumb"></span>`

    return `
        <li>
            ${img}
            <span>
                <strong>${escapeHtml(label)}</strong>
                <small>${escapeHtml(item.name ?? "")}</small>
            </span>
        </li>`
}


// ---------- API ----------

async function pendingLevelApi() {
    const { ok, status, dados } = await apiFetch("/niveis/pendente")

    if (status === 401) {
        goToLogin(dados?.erro)
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
