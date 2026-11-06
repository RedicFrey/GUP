import { apiFetch, showMessage, goToLogin } from '../../services/api.js'
import { escapeHtml } from '../../utils/escape-html.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'

// Cartão "Meu nível": XP atual e quanto falta para o próximo nível (GET /niveis/progresso).
// Usa as mesmas classes do cartão de meta (goal-card.css).
export async function levelProgress(section) {
    section.classList.add("goal-card")
    section.innerHTML = `<p class="loading">Carregando seu nível…</p>`

    const { ok, status, dados } = await apiFetch("/niveis/progresso")

    if (status === 401) {
        goToLogin(dados?.erro)
        return
    }
    if (!ok) {
        const message = document.createElement("p")
        showMessage(message, dados?.erro || "Não foi possível carregar o seu nível.", "erro")
        section.replaceChildren(message)
        return
    }

    const isMax = dados.next_level === null
    const levelXp = Number(dados.level_xp) || 0
    const nextXp = Number(dados.next_level_xp) || levelXp

    section.innerHTML = `
        <div class="goal-head">
            <span class="goal-icon">${pixelIcon("star", { size: 18 })}</span>
            <h2 class="goal-label">Meu nível</h2>
        </div>
        <p class="goal-name">Nível ${escapeHtml(dados.level)}</p>
        <div class="progress" role="progressbar" aria-label="XP até o próximo nível"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${escapeHtml(dados.percent)}">
            <span style="--value:${Number(dados.percent) || 0}%"></span>
        </div>
        <p class="goal-numbers">
            <span>${escapeHtml(dados.xp)} XP${isMax ? "" : ` de ${escapeHtml(nextXp)}`}</span>
            <span class="goal-missing">${isMax
                ? "nível máximo"
                : `faltam ${escapeHtml(dados.xp_to_next_level)} XP para o nível ${escapeHtml(dados.next_level)}`}</span>
        </p>
    `
}
