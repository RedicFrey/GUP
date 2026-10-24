
import { warning } from '../../generic/warning.js'

export async function deleteProfileApi(profileId){
    const { ok, status, dados } = await apiFetch(`/perfis-conta-familia/deletar/${profileId}`, { method: "DELETE" });

    if (status === 401) {
        window.location.href = "auth.html";
        return false;
    }

    if (!ok) {
        mostrarMensagem(mensagem, dados?.erro || errorMessage, "erro");
        return false;
    }

    return true;
}

export function createProfile(isResponsible, isAdmin, onSaved) {
 
    if (!isResponsible && !isAdmin) return
 
    const dialog = document.createElement("dialog")
    document.body.append(dialog)
    dialog.addEventListener("close", () => dialog.remove())   
 
    const typeHtml = isAdmin ? `
        <div>
            <label for="new-profile-type">Tipo</label>
            <select id="new-profile-type">
                <option value="child">Criança</option>
                <option value="responsible">Adulto (responsável)</option>
            </select>
        </div>` : ""
 
    dialog.innerHTML = `
        <div><button type="button" class="close-dialog">Voltar</button></div>
        <h3>Adicionar membro</h3>
        <form id="form-create-profile">
            <div>
                <label for="new-profile-name">Nome</label>
                <input id="new-profile-name" type="text" required>
            </div>
            ${typeHtml}
            <button type="submit">Criar</button>
        </form>
        <p id="create-profile-error"></p>
    `
 
    dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close())
 
    const form = dialog.querySelector("#form-create-profile")
    const errorMessage = dialog.querySelector("#create-profile-error")
    const submitBtn = form.querySelector('button[type="submit"]')
 
    form.addEventListener("submit", async (e) => {
        e.preventDefault()
 
        const name = form.querySelector("#new-profile-name").value.trim()
        if (!name) {
            mostrarMensagem(errorMessage, "Informe o nome.", "erro")
            return
        }
 
        // responsável comum nunca escolhe: sempre criança
        const profileType = isAdmin
            ? form.querySelector("#new-profile-type").value
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
    const { ok, status, dados } = await apiFetch("/perfis-conta-familia/adicionar", {
        method: "POST",
        body: { name, profileType },
    })
 
    if (status === 401) {
        window.location.href = "auth.html"
        return false
    }
 
    if (!ok) {
        mostrarMensagem(messageElement, dados?.erro || "Erro ao criar perfil.", "erro")
        return false
    }
 
    return true
}

// ---- Parte do Delete ----
export async function deleteFamilyAccount(isAdmin) {

    if (!isAdmin) return

    const dialog = document.createElement("dialog")
    document.body.append(dialog)
    dialog.addEventListener("close", () => dialog.remove())

    dialog.innerHTML = `
        <div><button type="button" class="close-dialog">Voltar</button></div>
        <div>
            <p>Se deseja prosseguir com a ação, digite a senha da conta.</p>
        </div>
        <form id="form-delete-family-account">
            <label for="delete-family-password">Senha</label>
            <input id="delete-family-password" type="password" minlength="8"
                autocomplete="current-password" required>
            <button type="submit">Enviar</button>
        </form>
        <p id="delete-family-error"></p>
    `

    dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close())

    const form = dialog.querySelector("#form-delete-family-account")
    const errorMessage = dialog.querySelector("#delete-family-error")
    const submitBtn = form.querySelector('button[type="submit"]')

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const password = form.querySelector("#delete-family-password").value

        const confirmed = await warning("Deseja realmente excluir a conta família?")
        if (!confirmed) {
            dialog.close()
            return
        }

        submitBtn.disabled = true
        const success = await deleteFamilyAccountApi(password, errorMessage)
        submitBtn.disabled = false

        if (!success) return        

        localStorage.removeItem("nameProfile")   
        window.location.href = "auth.html"
    })

    dialog.showModal()
}

async function deleteFamilyAccountApi(password, messageElement) {
    const { ok, dados } = await apiFetch("/conta/deletar", {    
        method: "DELETE",
        body: { password },
    })

    if (!ok) {
        mostrarMensagem(messageElement, dados?.erro || "Erro ao excluir a conta família.", "erro")
        return false
    }

    return true
}

const PROFILES_PATH = "/perfis-conta-familia"
 
 
// ---------- Orquestrador ----------
 
// Busca o perfil, abre o dialog com os dados, confirma com o warning e envia só o que mudou.
// onUpdated (opcional): chamado depois de salvar, para a tela recarregar.
export async function updateProfile(profileId, { onUpdated } = {}) {
    const profile = await listProfileForUpdateApi(profileId)
    if (!profile) return

    const dialog = document.createElement("dialog")
    document.body.append(dialog)
    dialog.addEventListener("close", () => dialog.remove())

    const closeBtn = document.createElement("button")
    closeBtn.type = "button"
    closeBtn.textContent = "X"
    closeBtn.addEventListener("click", () => dialog.close())

    const form = document.createElement("form")

    const saveBtn = document.createElement("button")
    saveBtn.type = "submit"
    saveBtn.textContent = "Alterar"
    saveBtn.disabled = true     // só habilita quando algo mudou

    // ---------- Nome e e-mail ----------
    const fields = profileFields(profile)
    const inputs = {}

    fields.forEach(({ key, label, type, required }) => {
        const row = document.createElement("div")

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

    const pinLabel = document.createElement("label")
    pinLabel.htmlFor = "profile-pin"
    pinLabel.textContent = "Pin"

    const pinInput = document.createElement("input")
    pinInput.id = "profile-pin"
    pinInput.autocomplete = "new-password"

    const pinEditBtn = document.createElement("button")
    pinEditBtn.type = "button"

    const pinRemoveBtn = document.createElement("button")
    pinRemoveBtn.type = "button"
    pinRemoveBtn.textContent = "Remover senha"

    pinRow.append(pinLabel, pinInput, pinEditBtn, pinRemoveBtn)
    form.append(pinRow)

    // estado parado: "****" se tem pin, campo vazio com "Sem senha" se não tem
    function showPin() {
        editingPin = false
        pinInput.readOnly = true
        pinInput.type = "text"          // com "password" apareceriam bolinhas, não ****
        pinInput.value = hasPin ? "****" : ""
        pinInput.placeholder = "Sem senha"
        pinEditBtn.textContent = hasPin ? "Alterar" : "Definir"
        pinRemoveBtn.hidden = !hasPin   // só existe se há senha para remover
        refreshSave()
    }

    function editPin() {
        editingPin = true
        pinInput.readOnly = false
        pinInput.type = "password"
        pinInput.value = ""
        pinInput.placeholder = "Novo pin"
        pinEditBtn.textContent = "Cancelar"
        pinInput.focus()
    }

    pinEditBtn.addEventListener("click", () => (editingPin ? showPin() : editPin()))

    // remover não espera o botão "Alterar": é aplicado na hora
    pinRemoveBtn.addEventListener("click", async () => {
        const confirmed = await warning("Deseja realmente remover a senha deste perfil?")
        if (!confirmed) return

        pinRemoveBtn.disabled = true
        const removed = await updateProfileApi(profileId, { pin: null })
        pinRemoveBtn.disabled = false
        if (!removed) return

        hasPin = false
        showPin()
        onUpdated?.()      // atualiza a página atrás do dialog
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

        const confirmed = await warning("Deseja realmente alterar os dados deste perfil?")
        if (!confirmed) {
            dialog.close()
            return
        }

        saveBtn.disabled = true
        const updated = await updateProfileApi(profileId, changes)
        if (!updated) {
            saveBtn.disabled = false    // deu erro: mantém o dialog aberto
            return
        }

        dialog.close()
        onUpdated?.()
    })

    form.append(saveBtn)
    showPin()

    dialog.append(closeBtn, form)
    dialog.showModal()
}

function profileFields(profile) {
    const isChild = profile.profile_type === "child"

    // o pin saiu daqui: tem tratamento próprio no dialog
    return [
        { key: "name", label: "Nome", type: "text", required: true },
        { key: "notification_email", label: isChild ? "Identificador" : "E-mail", type: isChild ? "text" : "email", required: false },
    ]
}

async function updateProfileApi(profileId, changes) {
    const r = await call(`${PROFILES_PATH}/atualizar-perfil/${profileId}`, "Erro ao atualizar o perfil.", {
        method: "PUT",
        body: changes,
    })
    return r !== null
}

// O pin novo só entra no envio se a pessoa clicou em “Alterar” ou “Definir” e digitou algo. O texto “****” nunca é enviado como se fosse o pin.

// family.js: atualizar na hora

// O renderFamilyAccount já refaz a página inteira, então é só passá-lo como callback. Hoje o updateProfile e o createProfile são chamados sem nenhum:

// Com isso, criar, editar, remover senha e excluir (que já fazia) atualizam a lista sem recarregar. Excluir a conta família continua redirecionando para o login.

// Bugs que vi no caminho
// PATCH e URL com barra dupla: o updateProfileApi antigo chamava //atualizar-perfil/... com PATCH, mas o controller é @profile_bp.put. Isso daria 405 e a edição nunca funcionaria. Já corrigi acima.
// Chave do e-mail: o front usava email, mas o service só aceita notification_email, então mudar o e-mail respondia “Nenhum dado válido para atualizar”. Troquei a chave. Confira se o GET /perfil/<id> devolve o campo com esse nome, senão o input abre vazio.
// required em tudo: o dialog antigo marcava todos os campos como obrigatórios. Com um perfil sem e-mail (criança, por exemplo), o formulário nunca poderia ser enviado. Agora só o nome é obrigatório.
// Falta de permissão na rota de atualizar: update_profile usa só @profile_required e o service não confere de qual família é o profile_id. Qualquer perfil logado, inclusive uma criança, consegue alterar ou remover o pin de qualquer perfil mandando o id na URL. Como agora existe “remover senha”, vale fechar isso:
// python
// # controller
// is_self = profile_id == session.get("profile_id")
// if not is_self and not session.get("is_admin"):
//     raise InvalidData("Você não tem permissão para alterar este perfil.")

// ---------- API ----------
 
function showError(text) {
    const el = document.querySelector("#mensagem")
    if (el) mostrarMensagem(el, text, "erro")
    else alert(text)
}

async function call(path, errorMessage, options) {
    const { ok, status, dados } = options ? await apiFetch(path, options) : await apiFetch(path)
 
    if (status === 401) {
        window.location.href = "auth.html"
        return null
    }
    if (!ok) {
        showError(dados?.erro || errorMessage)
        return null
    }
    return dados ?? {}
}
 
// Pega os dados do perfil que vai ser atualizado. Devolve o perfil, ou null se falhou.
async function listProfileForUpdateApi(profileId) {
    const dados = await call(`${PROFILES_PATH}/perfil/${profileId}`, "Erro ao carregar o perfil.")
    return dados?.profile ?? dados
}
 
 
