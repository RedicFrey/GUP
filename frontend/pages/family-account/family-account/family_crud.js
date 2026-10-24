import { warning } from '../../../components/confirm-modal/confirm-modal.js'
import { apiFetch, showMessage, goToLogin, PAGES } from '../../../services/api.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../components/avatar/avatar.js'

const PROFILES_PATH = "/perfis-conta-familia"

// cabeçalho padrão dos diálogos desta página
function dialogShell(title) {
    const dialog = document.createElement("dialog")
    dialog.className = "task-dialog"
    dialog.innerHTML = `
        <div class="task-dialog-head">
            <h3 class="dialog-title"></h3>
            <button type="button" class="btn btn-ghost btn-icon close-dialog" aria-label="Fechar">
                ${pixelIcon("close", { size: 16 })}
            </button>
        </div>
    `
    dialog.querySelector(".dialog-title").textContent = title
    dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close())
    dialog.addEventListener("close", () => dialog.remove())
    document.body.append(dialog)
    return dialog
}

export async function deleteProfileApi(profileId, messageElement) {
    const { ok, status, dados } = await apiFetch(`${PROFILES_PATH}/deletar/${profileId}`, { method: "DELETE" })

    if (status === 401) {
        goToLogin(dados?.erro)
        return false
    }

    if (!ok) {
        showMessage(messageElement ?? document.querySelector("#mensagem"), dados?.erro || "Não foi possível excluir o perfil.", "erro")
        return false
    }

    return true
}

// ---- Criar perfil ----
export function createProfile(isResponsible, isAdmin, onSaved) {
    if (!isResponsible && !isAdmin) return

    const dialog = dialogShell("Adicionar perfil")

    // só o admin escolhe o tipo; responsável comum sempre cria criança
    const typeHtml = isAdmin ? `
        <fieldset class="field">
            <legend>Tipo de perfil</legend>
            <div class="pick-group">
                <label class="pick pick-reward">
                    <input type="radio" name="new-profile-type" value="child" checked>
                    <span class="pick-reward-text"><strong>Criança</strong><small>Faz tarefas e junta moedas</small></span>
                </label>
                <label class="pick pick-reward">
                    <input type="radio" name="new-profile-type" value="responsible">
                    <span class="pick-reward-text"><strong>Responsável</strong><small>Cria tarefas e aprova</small></span>
                </label>
            </div>
        </fieldset>` : ""

    dialog.insertAdjacentHTML("beforeend", `
        <form id="form-create-profile">
            <div class="new-profile-preview" aria-hidden="true"></div>
            <div class="field">
                <label for="new-profile-name">Nome</label>
                <input id="new-profile-name" type="text" maxlength="20" placeholder="Bia" autocomplete="off" required>
            </div>
            ${typeHtml}
            <p id="create-profile-error" class="mensagem"></p>
            <div class="dialog-actions">
                <button type="button" class="btn btn-ghost" data-cancel>Cancelar</button>
                <button type="submit" class="btn-primary">Criar perfil</button>
            </div>
        </form>
    `)

    const form = dialog.querySelector("#form-create-profile")
    const errorMessage = dialog.querySelector("#create-profile-error")
    const submitBtn = form.querySelector('button[type="submit"]')
    const nameInput = form.querySelector("#new-profile-name")
    const preview = form.querySelector(".new-profile-preview")

    dialog.querySelector("[data-cancel]").addEventListener("click", () => dialog.close())

    // prévia do avatar enquanto digita o nome
    const drawPreview = () => {
        preview.innerHTML = avatar({ name: nameInput.value.trim() || "?" }, { size: 56, className: "avatar-lg" })
    }
    nameInput.addEventListener("input", drawPreview)
    drawPreview()

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const name = nameInput.value.trim()
        if (!name) {
            showMessage(errorMessage, "Digite o nome do perfil.", "erro")
            return
        }

        const profileType = isAdmin
            ? form.querySelector('input[name="new-profile-type"]:checked').value
            : "child"

        submitBtn.disabled = true
        const created = await createProfileApi(name, profileType, errorMessage)
        submitBtn.disabled = false

        if (!created) return

        dialog.close()
        onSaved?.()
    })

    dialog.showModal()
}

async function createProfileApi(name, profileType, messageElement) {
    const { ok, status, dados } = await apiFetch(`${PROFILES_PATH}/adicionar`, {
        method: "POST",
        body: { name, profileType },
    })

    if (status === 401) {
        goToLogin(dados?.erro)
        return false
    }

    if (!ok) {
        showMessage(messageElement, dados?.erro || "Não foi possível criar o perfil.", "erro")
        return false
    }

    return true
}

// ---- Excluir a conta da família ----
export async function deleteFamilyAccount(isAdmin) {
    if (!isAdmin) return

    const dialog = dialogShell("Excluir a conta da família")

    dialog.insertAdjacentHTML("beforeend", `
        <p class="dialog-text">Todos os perfis, tarefas, moedas e recompensas serão apagados. Para confirmar, digite a senha da conta.</p>
        <form id="form-delete-family-account">
            <div class="field">
                <label for="delete-family-password">Senha da conta</label>
                <input id="delete-family-password" type="password" minlength="8"
                    autocomplete="current-password" required>
            </div>
            <p id="delete-family-error" class="mensagem"></p>
            <div class="dialog-actions">
                <button type="button" class="btn btn-ghost" data-cancel>Cancelar</button>
                <button type="submit" class="btn btn-danger">Excluir para sempre</button>
            </div>
        </form>
    `)

    dialog.querySelector("[data-cancel]").addEventListener("click", () => dialog.close())

    const form = dialog.querySelector("#form-delete-family-account")
    const errorMessage = dialog.querySelector("#delete-family-error")
    const submitBtn = form.querySelector('button[type="submit"]')

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const password = form.querySelector("#delete-family-password").value

        const confirmed = await warning("Tem certeza? A conta da família será apagada e não volta mais.", { confirmLabel: "Excluir" })
        if (!confirmed) return

        submitBtn.disabled = true
        const success = await deleteFamilyAccountApi(password, errorMessage)
        submitBtn.disabled = false

        if (!success) return

        localStorage.clear()
        window.location.href = PAGES.auth
    })

    dialog.showModal()
}

async function deleteFamilyAccountApi(password, messageElement) {
    const { ok, dados } = await apiFetch("/conta/deletar", {
        method: "DELETE",
        body: { password },
    })

    if (!ok) {
        showMessage(messageElement, dados?.erro || "Não foi possível excluir a conta da família.", "erro")
        return false
    }

    return true
}

// ---------- Editar perfil (admin) ----------

// Busca o perfil, abre o dialog com os dados, confirma com o warning e envia só o que mudou.
// onUpdated (opcional): chamado depois de salvar, para a tela recarregar.
export async function updateProfile(profileId, { onUpdated } = {}) {
    const profile = await listProfileForUpdateApi(profileId)
    if (!profile) return

    const dialog = dialogShell(`Editar ${profile.name ?? "perfil"}`)

    const form = document.createElement("form")
    const message = document.createElement("p")
    message.className = "mensagem"

    // ---------- Nome e e-mail ----------
    const fields = profileFields(profile)
    const inputs = {}

    fields.forEach(({ key, label, type, required }) => {
        const row = document.createElement("div")
        row.className = "field"

        const labelEl = document.createElement("label")
        labelEl.htmlFor = `profile-${key}`
        labelEl.textContent = label

        const input = document.createElement("input")
        input.type = type
        input.id = `profile-${key}`
        input.required = required
        input.value = profile[key] ?? ""

        inputs[key] = input
        row.append(labelEl, input)
        form.append(row)
    })

    // ---------- Pin ----------
    let hasPin = Boolean(profile.has_pin)
    let editingPin = false

    const pinRow = document.createElement("div")
    pinRow.className = "field"

    const pinLabel = document.createElement("label")
    pinLabel.htmlFor = "profile-pin"
    pinLabel.textContent = "PIN"

    const pinLine = document.createElement("div")
    pinLine.className = "pin-line"

    const pinInput = document.createElement("input")
    pinInput.id = "profile-pin"
    pinInput.autocomplete = "new-password"
    pinInput.inputMode = "numeric"

    const pinEditBtn = document.createElement("button")
    pinEditBtn.type = "button"
    pinEditBtn.className = "btn btn-sm"

    const pinRemoveBtn = document.createElement("button")
    pinRemoveBtn.type = "button"
    pinRemoveBtn.className = "btn btn-sm btn-ghost"
    pinRemoveBtn.textContent = "Remover"

    pinLine.append(pinInput, pinEditBtn, pinRemoveBtn)
    pinRow.append(pinLabel, pinLine)
    form.append(pinRow)

    const saveBtn = document.createElement("button")
    saveBtn.type = "submit"
    saveBtn.className = "btn-primary"
    saveBtn.textContent = "Salvar alterações"
    saveBtn.disabled = true     // só habilita quando algo mudou

    const cancelBtn = document.createElement("button")
    cancelBtn.type = "button"
    cancelBtn.className = "btn btn-ghost"
    cancelBtn.textContent = "Cancelar"
    cancelBtn.addEventListener("click", () => dialog.close())

    const actions = document.createElement("div")
    actions.className = "dialog-actions"
    actions.append(cancelBtn, saveBtn)

    // estado parado: "Ativado" se tem pin, campo vazio com "Sem PIN" se não tem
    function showPin() {
        editingPin = false
        pinInput.readOnly = true
        pinInput.type = "text"
        pinInput.value = hasPin ? "Ativado" : ""
        pinInput.placeholder = "Sem PIN"
        pinInput.classList.add("input-quiet")
        pinEditBtn.textContent = hasPin ? "Alterar" : "Criar"
        pinRemoveBtn.hidden = !hasPin
        refreshSave()
    }

    function editPin() {
        editingPin = true
        pinInput.readOnly = false
        pinInput.type = "password"
        pinInput.value = ""
        pinInput.placeholder = "Novo PIN"
        pinInput.classList.remove("input-quiet")
        pinEditBtn.textContent = "Cancelar"
        pinRemoveBtn.hidden = true
        pinInput.focus()
    }

    pinEditBtn.addEventListener("click", () => (editingPin ? showPin() : editPin()))

    // remover é aplicado na hora, sem esperar o "Salvar"
    pinRemoveBtn.addEventListener("click", async () => {
        const confirmed = await warning("Remover o PIN deste perfil?", { confirmLabel: "Remover" })
        if (!confirmed) return

        pinRemoveBtn.disabled = true
        const removed = await updateProfileApi(profileId, { pin: null }, message)
        pinRemoveBtn.disabled = false
        if (!removed) return

        hasPin = false
        showPin()
        onUpdated?.()
    })

    // ---------- Mudanças e envio ----------
    function getChanges() {
        const changes = {}

        for (const { key } of fields) {
            const value = inputs[key].value.trim()
            if (value !== String(profile[key] ?? "")) changes[key] = value
        }

        if (editingPin) {
            const pin = pinInput.value.trim()
            if (pin) changes.pin = pin
        }

        return changes
    }

    function refreshSave() {
        saveBtn.disabled = Object.keys(getChanges()).length === 0
    }

    form.addEventListener("input", refreshSave)

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const changes = getChanges()
        if (Object.keys(changes).length === 0) return

        saveBtn.disabled = true
        const updated = await updateProfileApi(profileId, changes, message)
        if (!updated) {
            saveBtn.disabled = false    // deu erro: mantém o dialog aberto
            return
        }

        dialog.close()
        onUpdated?.()
    })

    form.append(message, actions)
    showPin()

    dialog.append(form)
    dialog.showModal()
}

function profileFields(profile) {
    const isChild = profile.profile_type === "child"

    // o pin tem tratamento próprio no dialog
    return [
        { key: "name", label: "Nome", type: "text", required: true },
    ]
}

async function updateProfileApi(profileId, changes, messageElement) {
    const r = await call(`${PROFILES_PATH}/atualizar-perfil/${profileId}`, "Não foi possível salvar o perfil.", {
        method: "PUT",
        body: changes,
    }, messageElement)
    return r !== null
}

// ---------- API ----------

async function call(path, errorMessage, options, messageElement) {
    const { ok, status, dados } = options ? await apiFetch(path, options) : await apiFetch(path)

    if (status === 401) {
        goToLogin(dados?.erro)
        return null
    }
    if (!ok) {
        showMessage(messageElement ?? document.querySelector("#mensagem"), dados?.erro || errorMessage, "erro")
        return null
    }
    return dados ?? {}
}

// Pega os dados do perfil que vai ser atualizado. Devolve o perfil, ou null se falhou.
async function listProfileForUpdateApi(profileId) {
    const dados = await call(`${PROFILES_PATH}/perfil/${profileId}`, "Não foi possível abrir o perfil.")
    return dados?.profile ?? dados
}


// ------------------------------------------------------------
// Anotações do grupo (mantidas da versão anterior)
// ------------------------------------------------------------
// O pin novo só entra no envio se a pessoa clicou em "Alterar" ou "Criar" e digitou algo.
// O texto do campo parado ("Ativado") nunca é enviado como se fosse o pin.
//
// Chave do e-mail: o service só aceita notification_email. Confira se o GET /perfil/<id>
// devolve o campo com esse nome, senão o input abre vazio.
//
// Falta de permissão na rota de atualizar: update_profile usa só @profile_required e o
// service não confere de qual família é o profile_id. Qualquer perfil logado, inclusive
// uma criança, consegue alterar ou remover o pin de qualquer perfil mandando o id na URL.
// Vale fechar isso no controller:
//   is_self = profile_id == session.get("profile_id")
//   if not is_self and not session.get("is_admin"):
//       raise InvalidData("Você não tem permissão para alterar este perfil.")
