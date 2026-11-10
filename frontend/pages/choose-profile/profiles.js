// ============================================================
// profiles.js -> tela "Quem está usando?"
// ============================================================
// Depois do login a conta da família está aberta, mas falta dizer
// QUEM está usando. Aparece um cartão para cada perfil.
// Se o perfil tiver PIN, abre a janelinha pedindo o PIN.

import { api } from "../../services/api.js"
import { nomeDoPapel, avatar } from "../../services/perfil.js"
import { escapeHtml } from "../../utils/formatar.js"

const lista = document.querySelector("#profiles-options")
const dialogoPin = document.querySelector("#dialogo-pin")
let perfis = []
let escolhido = null   // o perfil que pediu PIN


// GET /perfis-conta-familia/listar -> todos os perfis da conta
async function carregarPerfis() {
    perfis = await api("/perfis-conta-familia/listar")
    if (!perfis) return

    lista.innerHTML = perfis.map((perfil) => `
        <li>
            <button type="button" class="profile-tile" data-id="${perfil.id}">
                <span class="profile-tile-avatar">
                    ${avatar(perfil, "avatar-gg")}
                    ${perfil.has_pin ? `<span class="profile-lock"><i class="icone i-lock"></i></span>` : ""}
                </span>
                <span class="profile-tile-name">${escapeHtml(perfil.name)}</span>
                <span class="profile-tile-role">${nomeDoPapel(perfil)}</span>
            </button>
        </li>`).join("")
}

// POST /perfis-conta-familia/escolher/<id> com { pin } -> deu certo, vai para o perfil
async function entrar(id, pin, mensagem) {
    const entrou = await api(`/perfis-conta-familia/escolher/${id}`, { method: "POST", body: { pin }, mensagem })
    if (entrou) location.href = "../home/dashboard.html"
}

// Clique num cartão: com PIN abre a janelinha, sem PIN entra direto
lista.addEventListener("click", (evento) => {
    const cartao = evento.target.closest(".profile-tile")
    if (!cartao) return
    escolhido = perfis.find((p) => p.id === Number(cartao.dataset.id))

    if (!escolhido.has_pin) {
        entrar(escolhido.id, null)
        return
    }
    document.querySelector("#pin-titulo").textContent = `Olá, ${escolhido.name}!`
    document.querySelector("#pin").value = ""
    dialogoPin.showModal()
})

document.querySelector("#form-pin").addEventListener("submit", (evento) => {
    evento.preventDefault()
    entrar(escolhido.id, document.querySelector("#pin").value, document.querySelector("#pin-mensagem"))
})

// Sair da conta da família
document.querySelector("#sair").addEventListener("click", async () => {
    await api("/logout", { method: "POST" })
    location.href = "../auth/auth.html"
})

carregarPerfis()
