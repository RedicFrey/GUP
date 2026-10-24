import { ICONS } from '../../generic/icons.js'
import { warning } from '../../generic/warning.js'

export async function profile(currentUser, section) {

    const profileId = currentUser.id
    let hasPin = Boolean(currentUser.has_pin)

    // visualização do perfil
    const profileView = document.createElement("div")
    profileView.className = "profile-view"

    // o pin começa como "text" para mostrar "****" de verdade; vira "password" só ao editar
    const profileInputFields = [
        { id: "profile-input-name", fieldType: "text", fieldName: "Nome", dataKey: "name" },
        { id: "profile-input-pin", fieldType: "text", fieldName: "Pin", dataKey: "pin" }
    ];

    // valores originais, para saber se o campo mudou
    const originalValues = {}
    profileInputFields.forEach(f => {
        originalValues[f.dataKey] = f.dataKey === "pin"
            ? (hasPin ? '****' : '')
            : (currentUser[f.dataKey] ?? '')
    })

    const profileForm = document.createElement("form")

    profileForm.innerHTML = profileInputFields.map((field) => `
        <div class="profiles-fields">
            <label for="${field.id}">${field.fieldName}</label>
            <div>
                <input
                    type="${field.fieldType}"
                    id="${field.id}"
                    data-key="${field.dataKey}"
                    placeholder="${field.dataKey === "pin" ? "Sem senha" : ""}"
                    class="input-blocked"
                    readonly
                >
                <button type="button" class="btn-change-field">${ICONS.generic.edit}</button>
                ${field.dataKey === "pin"
                    ? `<button type="button" class="btn-remove-pin">Remover senha</button>`
                    : ""}
            </div>
        </div>
    `).join("");

    // o valor entra pelo .value, assim um nome com aspas ou < > não quebra o HTML
    profileInputFields.forEach(f => {
        profileForm.querySelector(`#${f.id}`).value = originalValues[f.dataKey]
    })

    const pinInput = profileForm.querySelector("#profile-input-pin")
    const removePinBtn = profileForm.querySelector(".btn-remove-pin")

    // desenha o pin conforme existe ou não senha: "****" ou vazio (com placeholder "Sem senha")
    function syncPin() {
        originalValues.pin = hasPin ? '****' : ''
        pinInput.value = originalValues.pin
        removePinBtn.hidden = !hasPin       // "Remover senha" só existe se há senha
    }

    syncPin()

    function lockInput(input, btn) {
        input.setAttribute('readonly', 'true')
        input.classList.add('input-blocked')
        if (input.dataset.key === "pin") input.type = "text"
        btn.innerHTML = ICONS.generic.edit
    }

    const btnsChange = profileForm.querySelectorAll(".btn-change-field")

    btnsChange.forEach((btn) => {
        btn.addEventListener('click', async (event) => {
            event.preventDefault()

            const input = btn.parentElement.querySelector('input')
            const key = input.dataset.key

            // Desbloquear para editar
            if (input.hasAttribute('readonly')) {
                input.removeAttribute('readonly')
                input.classList.remove('input-blocked')
                if (key === "pin") {
                    input.value = ""            // não editar em cima de "****"
                    input.type = "password"     // digitando, esconde os caracteres
                }
                input.focus()
                btn.textContent = "Salvar"
                return
            }

            // Salvar
            const newValue = input.value.trim()

            // vazio ou igual ao original: descarta
            if (!newValue || newValue === originalValues[key]) {
                input.value = originalValues[key]
                lockInput(input, btn)
                return
            }

            const saved = await updateProfile(profileId, {
                id: profileId,
                [key]: newValue     // só o campo alterado
            })

            if (saved) {
                if (key === "pin") {
                    hasPin = true
                    syncPin()
                } else {
                    originalValues[key] = newValue
                }
            }

            input.value = originalValues[key]
            lockInput(input, btn)
        })
    })

    // Remover senha: manda pin: null, que o back grava como NULL
    removePinBtn.addEventListener("click", async () => {
        const confirmed = await warning("Deseja realmente remover a sua senha?")
        if (!confirmed) return

        removePinBtn.disabled = true
        const removed = await updateProfile(profileId, { id: profileId, pin: null })
        removePinBtn.disabled = false
        if (!removed) return

        hasPin = false
        syncPin()
        lockInput(pinInput, pinInput.parentElement.querySelector(".btn-change-field"))
    })

    profileView.append(profileForm)
    section.append(profileView)

    // clicar fora cancela a edição
    document.addEventListener('click', (event) => {
        const path = event.composedPath()

        profileForm.querySelectorAll('input:not([readonly])').forEach((input) => {
            const divPai = input.parentElement
            if (!path.includes(divPai)) {
                input.value = originalValues[input.dataset.key]
                lockInput(input, divPai.querySelector('.btn-change-field'))
            }
        })
    })
}

async function updateProfile(profileId, data) {
    const { ok, status, dados } = await apiFetch(`/perfis-conta-familia/atualizar-perfil/${profileId}`, {
        method: "PUT",
        body: data,
    })

    if (status === 401) {
        window.location.href = "auth.html"
        return false
    }

    if (!ok) {
        // mostrarMensagem(mensagem, dados?.erro || "Erro ao atualizar perfil.", "erro")
        return false
    }

    return true
}
