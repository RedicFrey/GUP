
import { ICONS } from '../../generic/icons.js'

export async function profile(currentUser, section) {


    const profileId = currentUser.id
    // visualização do perfil
    const profileView = document.createElement("div")
    profileView.className = "profile-view"

    const profileInputFields = [
        { id: "profile-input-name", fieldType: "text", fieldName: "Nome", dataKey: "name" },
        { id: "profile-input-pin", fieldType: "password", fieldName: "Pin", dataKey: "pin" }
    ];

    // valores originais, para saber se o campo mudou
    const originalValues = {}
    profileInputFields.forEach(f => {
        if (f.dataKey === "pin") {
            originalValues[f.dataKey] = currentUser.has_pin ? '****' : ''
        } else {
            originalValues[f.dataKey] = currentUser[f.dataKey] ?? ''
        }
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
                    value="${originalValues[field.dataKey] ?? ''}"
                    class="input-blocked"
                    readonly
                >
                <button type="button" class="btn-change-field">${ICONS.generic.edit}</button>
            </div>
            
        </div>
    `).join("");

    function lockInput(input, btn) {
        input.setAttribute('readonly', 'true')
        input.classList.add('input-blocked')
        btn.textContent = "Mudar"
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
                if (key === "pin") input.value = ""   // não editar em cima de "****"
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

            // id na URL (dentro do updateProfile) e id dentro do data
            const saved = await updateProfile(profileId, {
                id: profileId,
                [key]: newValue     // só o campo alterado
            })

            if (saved) {
                originalValues[key] = key === "pin" ? "****" : newValue
            }

            input.value = originalValues[key]
            lockInput(input, btn)
        })
    })

    profileView.append(profileForm)
    section.append(profileView)

    // clicar fora cancela a edição
    document.addEventListener('click', (event) => {
        profileForm.querySelectorAll('input:not([readonly])').forEach((input) => {
            const divPai = input.parentElement
            if (!divPai.contains(event.target)) {
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



// foto de perfil e da girafa(se for criança)
    // const avatarView = document.createElement("div")

    // const avatarPreview = document.createElement("div")
    // const avatarSelected = document.createElement("div")
    // const modifyAvatar = document.createElement("button")
    
    // const characterToggle = document.createElement("button")

    // avatarView.className = "avatar-view"
    // avatarSelected.className = "avatar-selected"
    // modifyAvatar.className = "modify-avatar"
    // avatarPreview.className = "avatar-preview"
    // characterToggle.className = "character-toggle"

    // characterToggle.textContent = ">"
    // modifyAvatar.textContent = "mudar"
    // avatarPreview.append(avatarSelected, modifyAvatar)

    // avatarView.append(avatarPreview, characterToggle)


    // // visualização do perfil