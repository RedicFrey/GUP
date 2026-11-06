import { apiFetch, goToLogin } from '../services/api.js'

let pending = null

// Crianças da conta família (uma requisição por carregamento de página)
export function familyChildren({ fresh = false } = {}) {
    if (!pending || fresh) pending = fetchChildren()
    return pending
}

async function fetchChildren() {
    const { ok, dados, status } = await apiFetch("/perfis-conta-familia/criancas")

    if (status === 401) {
        goToLogin(dados?.erro)
        return
    }

    if (!ok) return

    return dados
}
