// ============================================================
// sidebar.js -> coloca no menu quem está logado e faz o "Sair"
// ============================================================
// O menu em si está escrito no HTML de cada página.
// Aqui só tem o que depende da API.

import { api } from "/frontend/services/api.js"
import { meuPerfil, nomeDoPapel, avatar } from "/frontend/services/perfil.js"
import { escapeHtml } from "/frontend/utils/formatar.js"

const jogador = document.querySelector(".nav-player")

// Sair: avisa o backend e volta para a tela de entrada
document.querySelector(".btn-logout").addEventListener("click", async () => {
    await api("/logout", { method: "POST" })
    location.href = "../auth/auth.html"
})

const perfil = await meuPerfil()

if (perfil) {
    // coloca "crianca" ou "responsavel" (e "admin") no <body>. O CSS usa isso para
    // esconder o que tem a classe so-crianca / so-responsavel / so-admin (ver style.css)
    document.body.classList.add(perfil.profile_type === "child" ? "crianca" : "responsavel")
    if (perfil.role === "admin") document.body.classList.add("admin")

    // criança vê nível e moedas; responsável vê o papel
    const embaixo = perfil.profile_type === "child"
        ? `Nível ${perfil.level_id} · <img class="moeda" src="../../assets/icons/coin-color.svg" alt=""> <span id="menu-moedas">${perfil.coins}</span>`
        : nomeDoPapel(perfil)

    jogador.innerHTML = `
        ${avatar(perfil)}
        <span class="nav-player-text">
            <strong class="nav-player-name">${escapeHtml(perfil.name)}</strong>
            <small class="nav-player-meta">${embaixo}</small>
        </span>`
}
