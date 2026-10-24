import { apiFetch, goToLogin } from './api.js'

// Várias partes da página (menu, perfil, nível) pedem o perfil logado.
// Guardamos a mesma promessa para fazer uma requisição só por carregamento.
let pending = null

export function loadMyProfile({ fresh = false } = {}) {
    if (!pending || fresh) pending = fetchMyProfile()
    return pending
}

async function fetchMyProfile() {
    const { ok, dados, status } = await apiFetch("/perfil/me")

    if (status === 401) {
        goToLogin(dados?.erro)
        return
    }

    if (!ok) return

    return dados
}

export const isChild = (profile) => profile?.profile_type === "child"
export const isResponsible = (profile) => profile?.profile_type === "responsible"
export const isAdmin = (profile) => profile?.role === "admin"

// short: versão curta para lugares apertados (menu lateral, cartões)
export function profileRoleLabel(profile, { short = false } = {}) {
    if (isChild(profile)) return "Criança"
    if (isAdmin(profile)) return short ? "Administrador" : "Administrador da família"
    return "Responsável"
}
