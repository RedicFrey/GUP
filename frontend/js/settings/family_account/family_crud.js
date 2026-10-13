
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

// export async function updateProfile(profileId){

// }

// async function listProfileForUpdateApi(){

// }

// async function updateProfileApi(){

// }

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
    console.log(profile)
    if (!profile) return
 
    const dialog = document.createElement("dialog")
    document.body.append(dialog)
    dialog.addEventListener("close", () => dialog.remove())   // limpa o DOM ao fechar
 
    const fields = profileFields(profile)
    const inputs = {}
 
    // monta com createElement: o valor entra pelo .value, sem risco de HTML
    const closeBtn = document.createElement("button")
    closeBtn.type = "button"
    closeBtn.textContent = "X"
    closeBtn.addEventListener("click", () => dialog.close())
 
    const form = document.createElement("form")
 
    fields.forEach(({ key, label, type }) => {
        const row = document.createElement("div")
 
        const labelEl = document.createElement("label")
        labelEl.htmlFor = `profile-${key}`
        labelEl.textContent = label
 
        const input = document.createElement("input")
        input.type = type
        input.id = `profile-${key}`
        input.required = true
        input.value = profile[key] ?? ""
 
        inputs[key] = input
        row.append(labelEl, input)
        form.append(row)
    })
 
    const saveBtn = document.createElement("button")
    saveBtn.type = "submit"
    saveBtn.textContent = "Alterar"
    saveBtn.disabled = true     // só habilita quando algo mudou
    form.append(saveBtn)
 
    // só o que mudou em relação ao que veio do back
    function getChanges() {
        const changes = {}
        for (const { key } of fields) {
            const value = inputs[key].value.trim()
            if (value !== String(profile[key] ?? "")) changes[key] = value
        }
        return changes
    }
 
    form.addEventListener("input", () => {
        saveBtn.disabled = Object.keys(getChanges()).length === 0
    })
 
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
 
    dialog.append(closeBtn, form)
    dialog.showModal()
}
 
// Campos editáveis. Os nomes (key) são os que o back usa: ajuste aqui se forem outros.
function profileFields(profile) {
    const isChild = profile.profile_type === "child"
 
    return [
        { key: "name", label: "Nome", type: "text" },
        { key: "email", label: isChild ? "Identificador" : "E-mail", type: isChild ? "text" : "email" },
        { key: "pin", label: "Pin:", type: "text"},
    ]
}

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
 
// Envia as mudanças. Devolve true/false.
async function updateProfileApi(profileId, changes) {
    const r = await call(`${PROFILES_PATH}//atualizar-perfil/${profileId}`, "Erro ao atualizar o perfil.", {
        method: "PATCH",
        body: changes,
    })
    return r !== null
}
 
