import { warning } from '../../../components/confirm-modal/confirm-modal.js'
import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'

// Linhas "Nome" e "PIN" do perfil logado.
// Cada linha tem dois estados: mostrando o valor, ou editando (campo + Salvar/Cancelar).
export async function profile(currentUser, section) {

    const profileId = currentUser.id
    let name = currentUser.name ?? ""
    let hasPin = Boolean(currentUser.has_pin)

    const wrapper = document.createElement("div")
    wrapper.className = "profile-view"
    wrapper.innerHTML = `
        <article class="settings-row" id="row-name">
            <div class="settings-row-text">
                <label class="settings-row-label" for="profile-input-name">${pixelIcon("user", { size: 16 })} Nome</label>
                <p class="settings-row-value" data-view></p>
                <input type="text" id="profile-input-name" data-key="name" maxlength="20" autocomplete="off" hidden>
            </div>
            <div class="settings-row-actions">
                <button type="button" class="btn btn-sm" data-edit>Alterar</button>
                <button type="button" class="btn btn-sm btn-ghost" data-cancel hidden>Cancelar</button>
                <button type="button" class="btn-primary btn-sm" data-save hidden>Salvar</button>
            </div>
            <p class="mensagem settings-row-message"></p>
        </article>

        <article class="settings-row" id="row-pin">
            <div class="settings-row-text">
                <label class="settings-row-label" for="profile-input-pin">${pixelIcon("lock", { size: 16 })} PIN</label>
                <p class="settings-row-value" data-view></p>
                <p class="settings-row-hint" data-hint>Com PIN, só quem sabe o código entra neste perfil.</p>
                <input type="password" id="profile-input-pin" data-key="pin" inputmode="numeric"
                    autocomplete="new-password" placeholder="Novo PIN" hidden>
            </div>
            <div class="settings-row-actions">
                <button type="button" class="btn btn-sm btn-ghost btn-remove-pin" data-remove>Remover</button>
                <button type="button" class="btn btn-sm" data-edit></button>
                <button type="button" class="btn btn-sm btn-ghost" data-cancel hidden>Cancelar</button>
                <button type="button" class="btn-primary btn-sm" data-save hidden>Salvar</button>
            </div>
            <p class="mensagem settings-row-message"></p>
        </article>
    `
    section.append(wrapper)

    const rowName = wrapper.querySelector("#row-name")
    const rowPin = wrapper.querySelector("#row-pin")

    function setEditing(row, editing) {
        const input = row.querySelector("input")
        input.hidden = !editing
        row.querySelector("[data-view]").hidden = editing
        row.querySelector("[data-edit]").hidden = editing
        row.querySelector("[data-cancel]").hidden = !editing
        row.querySelector("[data-save]").hidden = !editing
        const remove = row.querySelector("[data-remove]")
        if (remove) remove.hidden = editing || !hasPin
        row.classList.toggle("is-editing", editing)
        if (editing) input.focus()
    }

    function drawName() {
        rowName.querySelector("[data-view]").textContent = name
        setEditing(rowName, false)
    }

    function drawPin() {
        rowPin.querySelector("[data-view]").textContent = hasPin ? "Ativado" : "Sem PIN"
        rowPin.querySelector("[data-edit]").textContent = hasPin ? "Alterar PIN" : "Criar PIN"
        rowPin.querySelector("input").value = ""
        setEditing(rowPin, false)
    }

    drawName()
    drawPin()

    // ---- Nome ----
    rowName.querySelector("[data-edit]").addEventListener("click", () => {
        rowName.querySelector("input").value = name
        setEditing(rowName, true)
    })
    rowName.querySelector("[data-cancel]").addEventListener("click", drawName)

    async function saveName() {
        const input = rowName.querySelector("input")
        const newValue = input.value.trim()
        const message = rowName.querySelector(".settings-row-message")

        if (!newValue || newValue === name) {
            drawName()
            return
        }

        const saved = await updateProfile(profileId, { id: profileId, name: newValue }, message)
        if (!saved) return

        name = newValue
        drawName()
        // o menu lateral mostra o nome: atualiza na hora
        document.querySelector(".nav-player-name")?.replaceChildren(newValue)
        document.querySelector(".settings-id-name")?.replaceChildren(newValue)
    }
    rowName.querySelector("[data-save]").addEventListener("click", saveName)

    // ---- PIN ----
    rowPin.querySelector("[data-edit]").addEventListener("click", () => setEditing(rowPin, true))
    rowPin.querySelector("[data-cancel]").addEventListener("click", drawPin)

    async function savePin() {
        const newPin = rowPin.querySelector("input").value.trim()
        const message = rowPin.querySelector(".settings-row-message")

        if (!newPin) {
            drawPin()
            return
        }

        const saved = await updateProfile(profileId, { id: profileId, pin: newPin }, message)
        if (!saved) return

        hasPin = true
        drawPin()
        showMessage(message, "PIN salvo.", "sucesso")
    }
    rowPin.querySelector("[data-save]").addEventListener("click", savePin)

    // Enter salva, Esc cancela
    wrapper.addEventListener("keydown", (event) => {
        const input = event.target.closest("input")
        if (!input) return
        const row = input.closest(".settings-row")
        if (event.key === "Enter") {
            event.preventDefault()
            row === rowName ? saveName() : savePin()
        }
        if (event.key === "Escape") row === rowName ? drawName() : drawPin()
    })

    // Remover PIN: manda pin: null, que o back grava como NULL
    const removePinBtn = rowPin.querySelector("[data-remove]")
    removePinBtn.addEventListener("click", async () => {
        const confirmed = await warning("Remover o PIN deste perfil? Qualquer pessoa da família vai poder entrar nele.", { confirmLabel: "Remover" })
        if (!confirmed) return

        removePinBtn.disabled = true
        const removed = await updateProfile(profileId, { id: profileId, pin: null }, rowPin.querySelector(".settings-row-message"))
        removePinBtn.disabled = false
        if (!removed) return

        hasPin = false
        drawPin()
    })
}

async function updateProfile(profileId, data, messageElement) {
    const { ok, status, dados } = await apiFetch(`/perfis-conta-familia/atualizar-perfil/${profileId}`, {
        method: "PUT",
        body: data,
    })

    if (status === 401) {
        goToLogin(dados?.erro)
        return false
    }

    if (!ok) {
        showMessage(messageElement, dados?.erro || "Não foi possível salvar a alteração.", "erro")
        return false
    }

    if (messageElement) {
        messageElement.className = "mensagem settings-row-message"
        messageElement.textContent = ""
    }
    return true
}
