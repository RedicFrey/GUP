import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'

// Uma linha de permissão por item. key = nome do campo que a API usa.
const NOTIFICATION_TYPES = [
    { key: "tasks", label: "Tarefas enviadas", hint: "Quando uma criança mandar uma tarefa para você aprovar." },
    { key: "redemptions", label: "Resgates", hint: "Quando uma criança trocar moedas por uma recompensa." },
    { key: "events", label: "Eventos", hint: "Quando um evento novo for marcado na família." },
]

export async function notificationSetting(profile_type, containt) {
    if (profile_type !== "responsible") return

    containt.hidden = false
    const notification = await notificationListApi()

    if (!notification) {
        containt.innerHTML = `
            <h2 class="settings-group-title">Notificações por e-mail</h2>
            <p class="mensagem erro">Não foi possível carregar suas notificações.</p>
        `
        return
    }

    // O HTML não leva nenhum dado da API: o e-mail entra pelo .value (sem risco de HTML)
    containt.innerHTML = `
        <h2 class="settings-group-title">Notificações por e-mail</h2>
        <article class="settings-row" id="notification-email">
            <div class="settings-row-text">
                <label class="settings-row-label" for="notification-email-input">${pixelIcon("bell", { size: 16 })} E-mail para avisos</label>
                <input id="notification-email-input" type="email" class="input-blocked" placeholder="Nenhum e-mail cadastrado" readonly>
            </div>
            <div class="settings-row-actions">
                <button type="button" class="btn btn-sm btn-ghost" id="btn-remove-email" hidden>Remover</button>
                <button type="button" class="btn btn-sm" id="btn-change-email">Alterar</button>
            </div>
            <p id="notification-email-message" class="mensagem settings-row-message"></p>
        </article>
        <ul id="notification-permissions"></ul>
    `

    renderEmail(containt, notification.email ?? null)
    renderPermissions(containt, notification.permissions)
}


// ---------- E-mail ----------

function renderEmail(containt, initialEmail) {
    const emailInput = containt.querySelector("#notification-email-input")
    const changeBtn = containt.querySelector("#btn-change-email")
    const removeBtn = containt.querySelector("#btn-remove-email")
    const emailMessage = containt.querySelector("#notification-email-message")

    let email = initialEmail      // o que está salvo no servidor

    // estado "parado": campo trancado, com o e-mail salvo (ou vazio)
    function showSaved() {
        emailInput.value = email ?? ""
        emailInput.setAttribute("readonly", "true")
        emailInput.classList.add("input-blocked")
        changeBtn.textContent = email ? "Alterar" : "Adicionar"
        changeBtn.className = "btn btn-sm"
        removeBtn.hidden = !email
    }

    showSaved()

    changeBtn.addEventListener("click", async () => {
        // 1º clique: destranca para digitar
        if (emailInput.hasAttribute("readonly")) {
            emailMessage.textContent = ""
            emailMessage.className = "mensagem settings-row-message"
            emailInput.removeAttribute("readonly")
            emailInput.classList.remove("input-blocked")
            emailInput.focus()
            changeBtn.textContent = "Salvar"
            changeBtn.className = "btn-primary btn-sm"
            removeBtn.hidden = true
            return
        }

        // 2º clique: salva
        const newEmail = emailInput.value.trim()

        if (!newEmail || !emailInput.checkValidity()) {
            showMessage(emailMessage, "Digite um e-mail válido, como nome@email.com.", "erro")
            return
        }

        if (newEmail === email) {
            showSaved()
            return
        }

        changeBtn.disabled = true
        const saved = await notificationUpdateApi({ email: newEmail }, emailMessage)
        changeBtn.disabled = false

        if (!saved) return

        email = newEmail
        showSaved()
    })

    removeBtn.addEventListener("click", async () => {
        emailMessage.textContent = ""

        removeBtn.disabled = true
        const saved = await notificationUpdateApi({ email: null }, emailMessage)
        removeBtn.disabled = false

        if (!saved) return

        email = null
        showSaved()
    })

    // Esc cancela a edição e volta para o e-mail salvo
    emailInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") showSaved()
        if (event.key === "Enter") changeBtn.click()
    })
}


// ---------- Permissões (interruptores) ----------

function renderPermissions(containt, permissions) {
    const list = containt.querySelector("#notification-permissions")
    const current = permissions ?? {}

    list.innerHTML = NOTIFICATION_TYPES.map(({ key, label, hint }) => `
        <li class="settings-row">
            <div class="settings-row-text">
                <label class="settings-row-label" for="notify-${key}">${label}</label>
                <p class="settings-row-hint">${hint}</p>
            </div>
            <input type="checkbox" role="switch" class="switch" id="notify-${key}" data-key="${key}"
                ${current[key] ? "checked" : ""}>
            <p class="mensagem settings-row-message" data-message-for="${key}"></p>
        </li>
    `).join("")

    list.addEventListener("change", async (event) => {
        const toggle = event.target.closest('input[type="checkbox"]')
        if (!toggle) return

        const key = toggle.dataset.key
        const enabled = toggle.checked
        const message = list.querySelector(`[data-message-for="${key}"]`)

        message.textContent = ""
        message.className = "mensagem settings-row-message"
        toggle.disabled = true

        const saved = await notificationUpdateApi({ permissions: { [key]: enabled } }, message)

        toggle.disabled = false
        if (!saved) toggle.checked = !enabled       // volta como estava
    })
}


// ---------- API ----------

export async function notificationListApi() {
    const { ok, status, dados } = await apiFetch("/notificacoes/permitidas")

    if (status === 401) {
        goToLogin(dados?.erro)
        return null
    }

    if (!ok) return null

    return dados
}

async function notificationUpdateApi(changes, messageElement) {
    const { ok, status, dados } = await apiFetch("/notificacoes/permitidas/atualizar", {
        method: "PUT",
        body: changes,
    })

    if (status === 401) {
        goToLogin(dados?.erro)
        return false
    }

    if (!ok) {
        showMessage(messageElement, dados?.erro || "Não foi possível salvar as notificações.", "erro")
        return false
    }

    return true
}
