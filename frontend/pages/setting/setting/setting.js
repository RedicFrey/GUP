import { sideBar } from '../../../components/sidebar/sidebar.js'
import { profile } from './profile.js'
import { notificationSetting } from './notification.js'
import { loadMyProfile, profileRoleLabel } from '../../../services/perfil-service.js'
import { sectionCustomPage } from '../custom/setting_custom.js'
import { avatar } from '../../../components/avatar/avatar.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { pageUrl } from '../../../services/api.js'

const mainSetting = document.querySelector("#setting-container")
const FAMILY_PAGE = pageUrl("pages/family-account/family-account.html")

sideBar()

async function doConfig() {
    const currentUser = await loadMyProfile()
    if (!currentUser) return

    mainSetting.innerHTML = `
        <header class="page-head">
            <h1 class="page-title">Configurações</h1>
        </header>

        <section class="settings-id card">
            <span class="settings-id-avatar">${avatar(currentUser, { size: 64, className: "avatar-lg" })}</span>
            <div>
                <p class="settings-id-name">${escapeHtml(currentUser.name)}</p>
                <p class="settings-id-role">${escapeHtml(profileRoleLabel(currentUser))}</p>
            </div>
        </section>

        <section id="setting-containt">
            <section class="settings-group" id="profile-info-section">
                <h2 class="settings-group-title">Seu perfil</h2>
            </section>

            <section class="settings-group" id="edit-giraffe-section" hidden></section>

            <section class="settings-group">
                <h2 class="settings-group-title">Família</h2>
                <article id="go-to-family-account" class="settings-row">
                    <div class="settings-row-text">
                        <p class="settings-row-label">${pixelIcon("users", { size: 16 })} Conta da família</p>
                        <p class="settings-row-hint">Veja quem faz parte da família${currentUser.profile_type === "responsible" ? " e adicione novos perfis" : ""}.</p>
                    </div>
                    <a class="btn" href="${FAMILY_PAGE}">Abrir</a>
                </article>
            </section>

            <section class="settings-group" id="notification-containt" hidden></section>
        </section>
    `

    const profileSection = mainSetting.querySelector("#profile-info-section")
    const notificationContaint = mainSetting.querySelector("#notification-containt")
    const editGiraffeSection = mainSetting.querySelector("#edit-giraffe-section")

    sectionCustomPage(editGiraffeSection, currentUser.profile_type)
    profile(currentUser, profileSection)
    notificationSetting(currentUser.profile_type, notificationContaint)
}

document.addEventListener("DOMContentLoaded", () => {
    doConfig()
})
