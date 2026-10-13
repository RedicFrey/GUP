
export const escapeHtml = (v = '') => String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function loadMyProfile(){
    const { ok, dados, status } = await apiFetch("/perfil/me")

    if (status === 401) {
        window.location.href = "auth.html"
        return
    }

    if (!ok) {
        // mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar perfil.", "erro")
        return
    }

    return dados
}

export async function familyChildren(){
    const { ok, dados, status } = await apiFetch("/perfis-conta-familia/criancas")

    if (status === 401) {
        window.location.href = "auth.html"
        return
    }

    if (!ok) {
        // mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar perfil.", "erro")
        return
    }

    return dados
}
