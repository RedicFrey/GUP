import { apiFetch, API_URL, PAGES, pageUrl } from '../../services/api.js'
import { loadMyProfile, isChild, profileRoleLabel } from '../../services/perfil-service.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'
import { avatar } from '../avatar/avatar.js'
import { escapeHtml } from '../../utils/escape-html.js'

const LINKS = [
    { href: pageUrl("pages/home/dashboard.html"), text: "Meu perfil", icon: "user",
      also: [pageUrl("pages/task/")] },
    { href: pageUrl("pages/reward/reward.html"), text: "Recompensas", icon: "gift" },
    { href: pageUrl("pages/redemption/redemption.html"), text: "Resgates", icon: "ticket" },
    { href: pageUrl("pages/history/coin-history.html"), text: "Moedas", icon: "coin" },
    { href: pageUrl("pages/report/report.html"), text: "Relatório", icon: "chart" },
    { href: pageUrl("pages/setting/setting.html"), text: "Configurações", icon: "gear",
      also: [pageUrl("pages/setting/"), pageUrl("pages/family-account/")] },
]

// compara o endereço completo (sem ?filtros), então funciona de qualquer pasta
function isCurrent(link) {
    const here = window.location.href.split(/[?#]/)[0]
    return here === link.href || (link.also ?? []).some((prefix) => here.startsWith(prefix))
}

// Linha de baixo do cartão do perfil: nível e moedas para a criança, papel para o responsável
function playerMeta(profile) {
    if (!profile) return ""
    if (!isChild(profile)) return escapeHtml(profileRoleLabel(profile, { short: true }))
    return `
        <span>Nível ${escapeHtml(profile.level_id ?? 1)}</span>
        <span class="coin-amount">${pixelIcon("coinColor", { size: 14 })}${escapeHtml(profile.coins ?? 0)}</span>
    `
}

export async function sideBar() {
    const menuNav = document.createElement("nav")
    menuNav.id = "menu-nav"
    menuNav.setAttribute("aria-label", "Menu principal")

    const brand = `
        <a class="nav-brand" href="${PAGES.home}" aria-label="GUP, ir para o perfil">
            <img src="${API_URL}/static/giraffes/colors/color_primary.png" alt="" width="22" height="32"
                onerror="this.remove()">
            <span>GUP</span>
        </a>`

    menuNav.innerHTML = `
        ${brand}
        <a class="nav-player" href="${PAGES.home}">
            <span class="nav-player-avatar"></span>
            <span class="nav-player-text">
                <strong class="nav-player-name">&nbsp;</strong>
                <small class="nav-player-meta"></small>
            </span>
        </a>
        <ul class="sidebar-pages">
            ${LINKS.map((l) => `
                <li class="sidebar-item">
                    <a href="${l.href}" class="sidebar-link" ${isCurrent(l) ? 'aria-current="page"' : ""}>
                        <span class="sidebar-icon">${pixelIcon(l.icon, { size: 18 })}</span>
                        <span class="sidebar-text">${l.text}</span>
                    </a>
                </li>`).join("")}
        </ul>
        <div class="nav-foot">
            <a href="${PAGES.profiles}" class="sidebar-link">
                <span class="sidebar-icon">${pixelIcon("swap", { size: 18 })}</span>
                <span class="sidebar-text">Trocar perfil</span>
            </a>
            <button type="button" class="sidebar-link btn-logout">
                <span class="sidebar-icon">${pixelIcon("logout", { size: 18 })}</span>
                <span class="sidebar-text">Sair da conta</span>
            </button>
        </div>
    `

    // barra do topo (celular / tablet)
    const topbar = document.createElement("header")
    topbar.className = "topbar"
    topbar.innerHTML = `
        <button type="button" class="btn-menu" aria-expanded="false" aria-controls="menu-nav" aria-label="Abrir menu">
            ${pixelIcon("menu", { size: 20 })}
        </button>
        ${brand}
        <a class="topbar-avatar" href="${PAGES.home}" aria-label="Meu perfil"></a>
    `

    const overlay = document.createElement("div")
    overlay.className = "overlay"

    document.body.prepend(menuNav, topbar, overlay)

    // logout
    menuNav.querySelector(".btn-logout").addEventListener("click", async (event) => {
        event.preventDefault()
        await apiFetch("/logout", { method: "POST" })
        localStorage.clear()
        window.location.href = PAGES.auth
    })

    // abrir / fechar no celular
    const btnMenu = topbar.querySelector(".btn-menu")
    function toggleMenu(open) {
        menuNav.classList.toggle("open", open)
        overlay.classList.toggle("open", open)
        btnMenu.setAttribute("aria-expanded", String(open))
        btnMenu.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu")
    }
    btnMenu.addEventListener("click", () => toggleMenu(!menuNav.classList.contains("open")))
    overlay.addEventListener("click", () => toggleMenu(false))
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") toggleMenu(false)
    })

    // preenche com o perfil logado (sem cache antigo: troca de perfil aparece na hora)
    const profile = await loadMyProfile()
    if (!profile) return

    menuNav.querySelector(".nav-player-avatar").innerHTML = avatar(profile, { size: 44 })
    menuNav.querySelector(".nav-player-name").textContent = profile.name ?? ""
    menuNav.querySelector(".nav-player-meta").innerHTML = playerMeta(profile)
    topbar.querySelector(".topbar-avatar").innerHTML = avatar(profile, { size: 34 })
}

// O menu atualiza as moedas quando a página muda o saldo (compra, meta...)
export function refreshSidebarCoins(coins) {
    const el = document.querySelector(".nav-player-meta .coin-amount")
    if (el) el.innerHTML = `${pixelIcon("coinColor", { size: 14 })}${escapeHtml(coins)}`
}
