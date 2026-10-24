import { assetUrl } from '../../../services/api.js'
import { isChild, profileRoleLabel } from '../../../services/perfil-service.js'
import { escapeHtml } from '../../../utils/escape-html.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../components/avatar/avatar.js'
import { giraffeSprite } from '../../../components/giraffe-view/giraffe-view.js'

// Responsável não tem girafa: a capa é um cenário fixo, escolhido pelo id
// (sempre o mesmo para a mesma pessoa, como a capa padrão de uma rede social)
const RESPONSIBLE_COVERS = [1, 10, 20, 30, 8, 14, 25].map(
    (n) => `/static/giraffes/backgrounds/background_${n}.png`
)

function coverFor(profile, giraffe) {
    if (giraffe?.background?.image_url) return assetUrl(giraffe.background.image_url)
    const index = Math.abs(Number(profile?.id) || 0) % RESPONSIBLE_COVERS.length
    return assetUrl(RESPONSIBLE_COVERS[index])
}

// stats: [{ key, label, value, kind: "coin" | "xp" | "plain", action? }]
function statsHtml(stats) {
    return stats.map((s) => {
        const icon = s.kind === "coin" ? pixelIcon("coinColor", { size: 16 })
            : s.kind === "xp" ? pixelIcon("star", { size: 16 })
            : ""
        const value = `<span class="hero-stat-value hero-stat-${s.kind ?? "plain"}" data-stat="${s.key}">${icon}<span>${escapeHtml(s.value)}</span></span>`
        const label = `<span class="hero-stat-label">${escapeHtml(s.label)}</span>`

        return s.action
            ? `<li><button type="button" class="hero-stat hero-stat-button" data-action="${s.action}">${value}${label}</button></li>`
            : `<li class="hero-stat">${value}${label}</li>`
    }).join("")
}

export function renderHero(container, { profile, giraffe = null, stats = [], actions = "" }) {
    const child = isChild(profile)
    const hasSprite = child && giraffe?.color?.image_url

    const figure = hasSprite
        ? `<div class="hero-figure hero-figure-giraffe">${giraffeSprite(giraffe, { className: "hero-giraffe" })}</div>`
        : `<div class="hero-figure hero-figure-avatar">${avatar(profile, { size: 112, className: "avatar-lg" })}</div>`

    const subtitle = child
        ? `<span class="level-badge">Nível ${escapeHtml(profile.level_id ?? 1)}</span><span>Criança</span>`
        : `<span>${escapeHtml(profileRoleLabel(profile))}</span>`

    container.className = `profile-hero ${hasSprite ? "has-giraffe" : "has-avatar"}`
    container.innerHTML = `
        <div class="hero-cover">
            <img class="hero-cover-img" src="${escapeHtml(coverFor(profile, giraffe))}" alt="" onerror="this.remove()">
        </div>
        ${figure}
        <div class="hero-body">
            <div class="hero-id">
                <h1 class="hero-name">${escapeHtml(profile.name ?? "")}</h1>
                <p class="hero-sub">${subtitle}</p>
            </div>
            <ul class="hero-stats">${statsHtml(stats)}</ul>
            <div class="hero-actions">${actions}</div>
        </div>
    `
}

// atualiza um número da capa depois que ele chega da API
export function setHeroStat(container, key, value) {
    const el = container.querySelector(`[data-stat="${key}"] > span:last-child`)
    if (el) el.textContent = value
}
