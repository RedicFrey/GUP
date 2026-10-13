// apiFetch e mostrarMensagem são os globais do projeto (js/api.js)

// Uma linha de permissão por item. key = nome do campo que a API usa.
const NOTIFICATION_TYPES = [
    { key: "tasks",       label: "Tarefas" },
    { key: "redemptions", label: "Resgates" },
    { key: "events",      label: "Eventos" },
]

export async function notificationSetting(profile_type, containt) {
    if (profile_type !== "responsible") return

    const notification = await notificationListApi()

    if (!notification) {
        containt.innerHTML = `
            <h3>Notificações</h3>
            <div>Não foi possível mostrar suas notificações</div>
        `
        return
    }

    // O HTML não leva nenhum dado da API: o e-mail entra pelo .value (sem risco de HTML)
    containt.innerHTML = `
        <h3>Notificações</h3>
        <div id="notification-email">
            <label for="notification-email-input">E-mail</label>
            <input id="notification-email-input" type="email" class="input-blocked" readonly>
            <button type="button" id="btn-change-email">Mudar</button>
            <button type="button" id="btn-remove-email" hidden>Remover</button>
            <p id="notification-email-message"></p>
        </div>
        <div>
            <h3>Permissões de notificações</h3>
            <ul id="notification-permissions"></ul>
        </div>
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

    // desenha o estado "parado": input trancado, com o e-mail salvo (ou vazio)
    function showSaved() {
        emailInput.value = email ?? ""
        emailInput.setAttribute("readonly", "true")
        emailInput.classList.add("input-blocked")
        changeBtn.textContent = "Mudar"
        removeBtn.hidden = !email           // "Remover" só existe se há e-mail
    }

    showSaved()

    changeBtn.addEventListener("click", async () => {
        // 1º clique: destranca para digitar
        if (emailInput.hasAttribute("readonly")) {
            emailMessage.textContent = ""
            emailInput.removeAttribute("readonly")
            emailInput.classList.remove("input-blocked")
            emailInput.focus()
            changeBtn.textContent = "Salvar"
            return
        }

        // 2º clique: salva
        const newEmail = emailInput.value.trim()

        if (!newEmail || !emailInput.checkValidity()) {
            mostrarMensagem(emailMessage, "Informe um e-mail válido.", "erro")
            return
        }

        if (newEmail === email) {           // nada mudou
            showSaved()
            return
        }

        changeBtn.disabled = true
        const saved = await notificationUpdateApi({ email: newEmail }, emailMessage)
        changeBtn.disabled = false

        if (!saved) return                  // deu erro: continua em edição, com a mensagem

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
    })
}


// ---------- Permissões (radios) ----------

function renderPermissions(containt, permissions) {
    const list = containt.querySelector("#notification-permissions")
    const current = permissions ?? {}

    list.innerHTML = NOTIFICATION_TYPES.map(({ key, label }) => `
        <li>
            <div>${label}</div>
            <div>
                <label>
                    <input type="radio" name="notify-${key}" data-key="${key}" value="true"
                        ${current[key] ? "checked" : ""}> Ativada
                </label>
                <label>
                    <input type="radio" name="notify-${key}" data-key="${key}" value="false"
                        ${current[key] ? "" : "checked"}> Desativada
                </label>
            </div>
            <p data-message-for="${key}"></p>
        </li>
    `).join("")

    list.addEventListener("change", async (event) => {
        const radio = event.target.closest('input[type="radio"]')
        if (!radio) return

        const key = radio.dataset.key
        const enabled = radio.value === "true"
        const message = list.querySelector(`[data-message-for="${key}"]`)
        const group = list.querySelectorAll(`input[name="notify-${key}"]`)

        message.textContent = ""
        group.forEach((input) => input.disabled = true)       

        const saved = await notificationUpdateApi({ permissions: { [key]: enabled } }, message)

        group.forEach((input) => input.disabled = false)

        if (saved) return

        list.querySelector(`input[name="notify-${key}"][value="${!enabled}"]`).checked = true
    })
}


// ---------- API (rotas: ajuste às do seu back) ----------

export async function notificationListApi() {
    const { ok, status, dados } = await apiFetch("/notificacoes/permitidas")

    if (status === 401) {
        window.location.href = "auth.html"
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
        window.location.href = "auth.html"
        return false
    }

    if (!ok) {
        mostrarMensagem(messageElement, dados?.erro || "Erro ao atualizar notificações.", "erro")
        return false
    }

    return true
}
