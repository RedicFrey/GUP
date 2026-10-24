import { apiFetch, showMessage, PAGES } from '../../services/api.js'
import { escapeHtml } from '../../utils/escape-html.js'
import { avatar } from '../../components/avatar/avatar.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'
import { profileRoleLabel } from '../../services/perfil-service.js'

const sectionProfiles = document.querySelector("#choose-profile")
const messageErroProfile = document.querySelector("#message-erro-profile")
const modalPin = document.querySelector("#modal-pin")

function chooseProfile(profile) {
    messageErroProfile.textContent = ""
    messageErroProfile.className = "mensagem"

    if (!profile.has_pin) {
        fazerLogin(profile.id, null)
        return
    }

    modalPin.innerHTML = `
        <form id="form-pin-profile" class="pin-form">
            <div class="pin-who">
                ${avatar(profile, { size: 64, className: "avatar-lg" })}
                <h2 id="pin-title" class="pin-title"></h2>
            </div>
            <div class="field">
                <label for="profile-pin">PIN</label>
                <input type="password" id="profile-pin" inputmode="numeric" autocomplete="off" required>
            </div>
            <p id="pin-message" class="mensagem"></p>
            <div class="dialog-actions">
                <button type="button" id="btn-cancelar-pin" class="btn btn-ghost">Cancelar</button>
                <button type="submit" class="btn-primary">Entrar</button>
            </div>
        </form>
    `
    modalPin.querySelector("#pin-title").textContent = `Olá, ${profile.name}! Digite seu PIN.`

    modalPin.querySelector("#form-pin-profile").addEventListener("submit", async (e) => {
        e.preventDefault()
        const pin = modalPin.querySelector("#profile-pin").value
        await fazerLogin(profile.id, pin, modalPin.querySelector("#pin-message"))
    })

    modalPin.querySelector("#btn-cancelar-pin").addEventListener("click", () => modalPin.close())

    modalPin.showModal()
}

async function fazerLogin(id, pin, messageElement = messageErroProfile) {
    const data = {}
    if (pin) data.pin = pin

    const response = await apiFetch(`/escolher-perfil/${id}`, {
        method: "POST",
        body: data,
    })

    if (!response.ok) {
        showMessage(messageElement, response.dados?.erro || "Não foi possível entrar nesse perfil.", "erro")
        return
    }

    if (modalPin.open) modalPin.close()
    window.location.href = PAGES.home
}

function profileTile(profile) {
    const role = profileRoleLabel(profile, { short: true })
    const lock = profile.has_pin
        ? `<span class="profile-lock" title="Protegido por PIN">${pixelIcon("lock", { size: 14, label: "Protegido por PIN" })}</span>`
        : ""

    return `
        <li>
            <button type="button" class="profile-tile ${profile.profile_type === "child" ? "is-child" : ""}" data-profile-id="${escapeHtml(profile.id)}">
                <span class="profile-tile-avatar">
                    ${avatar(profile, { size: 112, className: "avatar-lg" })}
                    ${lock}
                </span>
                <span class="profile-tile-name">${escapeHtml(profile.name)}</span>
                <span class="profile-tile-role">${escapeHtml(role)}</span>
            </button>
        </li>`
}

export async function showProfiles() {
    sectionProfiles.innerHTML = `<p class="loading">Carregando os perfis…</p>`
    const response = await apiFetch("/conta-familia/perfis")

    if (response.status === 401) {
        window.location.href = PAGES.auth
        return
    }

    if (!response.ok) {
        sectionProfiles.innerHTML = ""
        showMessage(messageErroProfile, response.dados?.erro || "Não foi possível carregar os perfis da família.", "erro")
        return
    }

    const profiles = response.dados ?? []

    // responsáveis primeiro, depois as crianças
    const sorted = [...profiles].sort((a, b) =>
        (a.profile_type === "child") - (b.profile_type === "child"))

    sectionProfiles.innerHTML = `<ul id="profiles-options">${sorted.map(profileTile).join("")}</ul>`

    sectionProfiles.querySelector("#profiles-options").addEventListener("click", (event) => {
        const tile = event.target.closest(".profile-tile")
        if (!tile) return
        const profile = profiles.find((p) => String(p.id) === tile.dataset.profileId)
        if (profile) chooseProfile(profile)
    })
}

document.querySelector("#btn-logout").addEventListener("click", async () => {
    await apiFetch("/logout", { method: "POST" })
    localStorage.clear()
    window.location.href = PAGES.auth
})

document.addEventListener("DOMContentLoaded", () => {
    showProfiles()
})
