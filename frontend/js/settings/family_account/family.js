
import { sideBar } from '../../generic/side_bar.js'
import { loadMyProfile, escapeHtml } from '../../generic/utils.js'
import { warning } from '../../generic/warning.js'
import { createProfile, updateProfile, deleteProfileApi, deleteFamilyAccount } from './family_crud.js'

const familyContainer = document.querySelector("#family-account-container")

sideBar()

async function familyAccountProfiles() {

    try {
        const { ok, dados, status } = await apiFetch("/conta/info");

        if (status === 401) {
            window.location.href = "auth.html"
            return
        }

        if (!ok) {
            // triggerPageFallback(section)
            return
        }

        return dados
        // buildFamilyAccountPage(section, dados)
    } catch (err) {
        // console.error(err)
        // triggerPageFallback(section)
    }
}

async function renderFamilyAccount() {

    const children = await familyAccountProfiles()
    const me = await loadMyProfile()
    if (!me) return

    const isResponsible = me.profile_type === "responsible"
    const isAdmin = me.role === "admin"

    const addMemberHtml = isResponsible ? `
        <div>
            <button type="button" id="btn-add-member">Adicionar membro</button>
        </div>` : ""

    const deleteAccountHtml = isAdmin ? `
        <div>
            <button type="button" id="btn-delete-family-account">Excluir conta família</button>
        </div>` : ""

    familyContainer.innerHTML = `
        <div>
            <a href="setting.html">Voltar</a>
        </div>
        <h2>Conta Família</h2>
        <section id="family-profiles-container"></section>
        <section id="admin-responsible-containt">
            ${addMemberHtml}
            ${deleteAccountHtml}
        </section>
    `

    familyContainer.querySelector("#btn-add-member")
        ?.addEventListener("click", () => createProfile(isResponsible, isAdmin, renderFamilyAccount))

    familyContainer.querySelector("#btn-delete-family-account")
        ?.addEventListener("click", () => deleteFamilyAccount(isAdmin))

    const familyProfiles = familyContainer.querySelector("#family-profiles-container")
    renderProfilesFamily(children, familyProfiles, isAdmin)
}

function renderProfilesFamily(profilesData, section, isAdmin) {
    const profiles = profilesData?.profiles ?? []

    const list = profiles.map((profile) => {
        // Editar e Excluir: só para o admin
        const adminButtons = isAdmin ? `
            <div>
                <button type="button" data-action="edit"
                    data-profile-id="${escapeHtml(profile.id)}">Editar</button>
                <button type="button" data-action="delete"
                    data-profile-id="${escapeHtml(profile.id)}">Excluir</button>
            </div>` : ""

        return `
            <div>
                <div>
                    <p>${escapeHtml(profile.name)}</p>
                    <p>${escapeHtml(profile.profile_type)}</p>
                </div>
                ${adminButtons}
            </div>
        `
    }).join("")

    section.innerHTML = `
        <h3>Perfis:</h3>
        ${list}
    `

    if (!isAdmin) return

    // um listener só na lista, que descobre qual botão foi clicado
    section.onclick = async (event) => {
        const btn = event.target.closest("[data-action]")
        if (!btn) return

        const profileId = btn.dataset.profileId
        const profile = profiles.find((p) => String(p.id) === profileId)

        if (btn.dataset.action === "edit") {
            updateProfile(profileId, { onUpdated: renderFamilyAccount })
            return
        }

        if (btn.dataset.action === "delete") {
            const confirmed = await warning(
                `Deseja realmente excluir o perfil "${escapeHtml(profile?.name ?? "")}"?`
            )
            if (!confirmed) return

            const deleted = await deleteProfileApi(profileId)
            if (deleted) renderFamilyAccount()    // refaz a página sem o perfil excluído
        }
    }
}

document.addEventListener("DOMContentLoaded", ()=>{
    renderFamilyAccount()
})

