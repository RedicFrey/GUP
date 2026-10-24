import { sideBar } from '../../../components/sidebar/sidebar.js'
import { loadMyProfile, profileRoleLabel } from '../../../services/perfil-service.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { warning } from '../../../components/confirm-modal/confirm-modal.js'
import { avatar } from '../../../components/avatar/avatar.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { createProfile, updateProfile, deleteProfileApi, deleteFamilyAccount } from './family_crud.js'
import { apiFetch, showMessage, goToLogin, pageUrl } from '../../../services/api.js'

const familyContainer = document.querySelector("#family-account-container")

sideBar()

async function familyAccountProfiles() {
    try {
        const { ok, dados, status } = await apiFetch("/conta/info")

        if (status === 401) {
            goToLogin(dados?.erro)
            return
        }

        if (!ok) return

        return dados
    } catch (err) {
        console.error(err)
    }
}

async function renderFamilyAccount() {
    const [account, me] = await Promise.all([familyAccountProfiles(), loadMyProfile()])
    if (!me) return

    const isResponsible = me.profile_type === "responsible"
    const isAdmin = me.role === "admin"

    const addMemberHtml = isResponsible ? `
        <button type="button" id="btn-add-member" class="btn-primary">
            ${pixelIcon("plus", { size: 14 })} Adicionar perfil
        </button>` : ""

    const deleteAccountHtml = isAdmin ? `
        <section class="danger-zone">
            <div>
                <h2 class="danger-title">Excluir a conta da família</h2>
                <p class="danger-text">Apaga todos os perfis, tarefas, moedas e recompensas. Não dá para desfazer.</p>
            </div>
            <button type="button" id="btn-delete-family-account" class="btn btn-danger">Excluir conta</button>
        </section>` : ""

    familyContainer.innerHTML = `
        <a class="back-link" href="${pageUrl("pages/setting/setting.html")}">‹ Voltar para as configurações</a>
        <header class="page-head">
            <div>
                <h1 class="page-title">Conta da família</h1>
                <p class="page-sub">Cada pessoa tem o seu perfil. ${isAdmin
                    ? "Como administrador, você pode editar e excluir perfis."
                    : isResponsible ? "Responsáveis podem adicionar crianças." : ""}</p>
            </div>
            ${addMemberHtml}
        </header>
        <p id="mensagem" class="mensagem"></p>
        <section id="family-profiles-container"></section>
        ${deleteAccountHtml}
    `

    familyContainer.querySelector("#btn-add-member")
        ?.addEventListener("click", () => createProfile(isResponsible, isAdmin, renderFamilyAccount))

    familyContainer.querySelector("#btn-delete-family-account")
        ?.addEventListener("click", () => deleteFamilyAccount(isAdmin))

    const familyProfiles = familyContainer.querySelector("#family-profiles-container")
    renderProfilesFamily(account, familyProfiles, isAdmin, me)
}

function memberMeta(profile) {
    if (profile.profile_type !== "child") return ""
    return `
        <p class="member-meta">
            <span>Nível ${escapeHtml(profile.level_id ?? 1)}</span>
            <span class="coin-amount">${pixelIcon("coinColor", { size: 12 })}${escapeHtml(profile.coins ?? 0)}</span>
        </p>`
}

function renderProfilesFamily(profilesData, section, isAdmin, me) {
    const profiles = profilesData?.profiles ?? []

    if (!profiles.length) {
        section.innerHTML = `<div class="empty"><p>Nenhum perfil encontrado.</p></div>`
        return
    }

    // responsáveis primeiro
    const sorted = [...profiles].sort((a, b) => (a.profile_type === "child") - (b.profile_type === "child"))

    const list = sorted.map((profile) => {
        const isMe = String(profile.id) === String(me.id)

        // Editar e Excluir: só para o admin (e ninguém se exclui por aqui)
        const adminButtons = isAdmin ? `
            <div class="member-actions">
                <button type="button" class="btn btn-sm" data-action="edit"
                    data-profile-id="${escapeHtml(profile.id)}">${pixelIcon("edit", { size: 12 })} Editar</button>
                ${isMe ? "" : `<button type="button" class="btn btn-sm btn-ghost member-delete" data-action="delete"
                    data-profile-id="${escapeHtml(profile.id)}">${pixelIcon("trash", { size: 12 })} Excluir</button>`}
            </div>` : ""

        return `
            <li class="member-card ${isMe ? "is-me" : ""}">
                <span class="member-avatar">
                    ${avatar(profile, { size: 64, className: "avatar-lg" })}
                    ${profile.has_pin ? `<span class="member-lock" title="Protegido por PIN">${pixelIcon("lock", { size: 12 })}</span>` : ""}
                </span>
                <div class="member-text">
                    <p class="member-name">${escapeHtml(profile.name)}${isMe ? ` <span class="member-you">você</span>` : ""}</p>
                    <p class="member-role">${escapeHtml(profileRoleLabel(profile, { short: true }))}</p>
                    ${memberMeta(profile)}
                </div>
                ${adminButtons}
            </li>
        `
    }).join("")

    section.innerHTML = `<ul class="member-grid">${list}</ul>`

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
                `Excluir o perfil "${profile?.name ?? ""}"? As tarefas e moedas dele também serão apagadas.`,
                { confirmLabel: "Excluir perfil" }
            )
            if (!confirmed) return

            const deleted = await deleteProfileApi(profileId, familyContainer.querySelector("#mensagem"))
            if (deleted) renderFamilyAccount()
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderFamilyAccount().catch((err) => {
        console.error(err)
        showMessage(familyContainer.querySelector("#mensagem"), "Não foi possível carregar a família.", "erro")
    })
})
