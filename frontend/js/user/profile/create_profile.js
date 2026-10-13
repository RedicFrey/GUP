
const TIPO_RESPONSAVEL = "responsible";
const PIN_REGEX = /^\d{4}$/;

function dialogProfile(dialog, btnText) {
    const formCreateProfile = document.createElement("form")
    formCreateProfile.innerHTML = `
        <div class="create-profile-fields">
            <label for="create-profile-type">Tipo de perfil</label>
            <select id="create-profile-type">
                <option value="responsible">Responsável</option>
                <option value="child">Criança</option>
            </select>
        </div>
        <div class="create-profile-fields">
            <label for="create-profile-name">Nome</label>
            <input id="create-profile-name" type="text" required>
        </div>
        <div class="create-profile-fields">
            <label for="create-profile-pin">Pin (opcional)</label>
            <input id="create-profile-pin" type="password">
        </div>
        <p id="create-profile-erro" class="mensagem"></p>
        <button id="submit-create-profile" type="submit">${btnText}</button>
    `
    dialog.append(formCreateProfile)
    return formCreateProfile
}

export function createProfile(dialog, onCreate) {
    const form = dialogProfile(dialog, "Criar")

    const fieldType = form.querySelector("#create-profile-type")
    const fieldName = form.querySelector("#create-profile-name")
    const fieldPin = form.querySelector("#create-profile-pin")
    const erroEl = form.querySelector("#create-profile-erro")

    form.addEventListener("submit", (evento) => {
        evento.preventDefault()
        erroEl.textContent = ""

        const name = fieldName.value.trim()
        const profileType = fieldType.value
        const pin = fieldPin.value.trim()

        if (!name) {
            erroEl.textContent = "Informe o nome do perfil."
            return
        }
        if (pin && !PIN_REGEX.test(pin)) {
            erroEl.textContent = "O PIN deve ter 4 números."
            return
        }

        onCreate({
            name,
            profileType,
            pin: pin || null,
        })

        form.reset()
        atualizarCampoEmail()
    })

    return form
}