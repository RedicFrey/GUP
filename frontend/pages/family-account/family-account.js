// ============================================================
// family-account.js -> página "Conta da família"
// ============================================================
// Mostra todos os perfis da conta.
//   - responsável: pode adicionar perfil
//   - administrador: também edita, exclui perfis e exclui a conta
// Os formulários estão no HTML (dentro dos <dialog>).

import { api } from "../../services/api.js"
import { meuPerfil, nomeDoPapel, avatar } from "../../services/perfil.js"
import { escapeHtml } from "../../utils/formatar.js"

const membros = document.querySelector("#membros")
const eu = await meuPerfil()
const ehAdmin = eu?.role === "admin"
let perfis = []
let editando = null   // o perfil aberto na janelinha de editar


// GET /conta/info -> { profiles: [...] }
async function carregarFamilia() {
    const dados = await api("/conta/info")
    if (!dados) return
    perfis = dados.profiles

    membros.innerHTML = perfis.map((perfil) => {
        const souEu = perfil.id === eu.id
        // botões só para o admin (e ninguém exclui a si mesmo)
        const botoes = ehAdmin ? `
            <div class="member-actions">
                <button type="button" class="btn btn-sm" data-editar="${perfil.id}"><i class="icone i-edit"></i> Editar</button>
                ${souEu ? "" : `<button type="button" class="btn btn-sm btn-ghost" data-excluir="${perfil.id}"><i class="icone i-trash"></i> Excluir</button>`}
            </div>` : ""

        return `
            <li class="member-card ${souEu ? "is-me" : ""}">
                ${avatar(perfil, "avatar-g")}
                <div class="member-text">
                    <p class="member-name">${escapeHtml(perfil.name)} ${souEu ? `<span class="member-you">você</span>` : ""}</p>
                    <p class="member-role">${nomeDoPapel(perfil)} ${perfil.has_pin ? "(com PIN)" : ""}</p>
                    ${perfil.profile_type === "child" ? `<p class="member-meta">Nível ${perfil.level_id}, ${perfil.coins} moedas</p>` : ""}
                </div>
                ${botoes}
            </li>`
    }).join("")
}


// Cliques nos botões Editar / Excluir de qualquer cartão
membros.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button")
    if (!botao) return

    // Editar: preenche a janelinha e abre
    if (botao.dataset.editar) {
        editando = perfis.find((p) => p.id === Number(botao.dataset.editar))
        document.querySelector("#editar-titulo").textContent = `Editar ${editando.name}`
        document.querySelector("#editar-nome").value = editando.name
        document.querySelector("#editar-pin").value = ""
        document.querySelector("#remover-pin").checked = false
        document.querySelector("#dialogo-editar").showModal()
        return
    }

    // DELETE /perfis-conta-familia/deletar/<id>
    if (!confirm("Excluir este perfil? As tarefas e moedas dele também somem.")) return
    if (await api(`/perfis-conta-familia/deletar/${botao.dataset.excluir}`, { method: "DELETE" })) carregarFamilia()
})


// POST /perfis-conta-familia/adicionar com { name, profileType }
document.querySelector("#adicionar").addEventListener("click", () => document.querySelector("#dialogo-adicionar").showModal())

document.querySelector("#form-adicionar").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const criou = await api("/perfis-conta-familia/adicionar", {
        method: "POST",
        body: {
            name: document.querySelector("#novo-nome").value.trim(),
            profileType: ehAdmin ? document.querySelector('input[name="tipo"]:checked').value : "child",
        },
        mensagem: document.querySelector("#novo-mensagem"),
    })
    if (!criou) return
    document.querySelector("#dialogo-adicionar").close()
    document.querySelector("#form-adicionar").reset()
    carregarFamilia()
})


// PUT /perfis-conta-familia/atualizar-perfil/<id>
// manda o nome e, se digitou, o PIN novo. "Remover o PIN" manda pin: null
document.querySelector("#form-editar").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const mudancas = { id: editando.id, name: document.querySelector("#editar-nome").value.trim() }
    const pin = document.querySelector("#editar-pin").value.trim()
    if (pin) mudancas.pin = pin
    if (document.querySelector("#remover-pin").checked) mudancas.pin = null

    const salvou = await api(`/perfis-conta-familia/atualizar-perfil/${editando.id}`, {
        method: "PUT",
        body: mudancas,
        mensagem: document.querySelector("#editar-mensagem"),
    })
    if (!salvou) return
    document.querySelector("#dialogo-editar").close()
    carregarFamilia()
})


// DELETE /conta/deletar com { password } -> depois volta para a tela de entrada
document.querySelector("#excluir-conta").addEventListener("click", () => document.querySelector("#dialogo-excluir-conta").showModal())

document.querySelector("#form-excluir-conta").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const excluiu = await api("/conta/deletar", {
        method: "DELETE",
        body: { password: document.querySelector("#senha").value },
        mensagem: document.querySelector("#excluir-mensagem"),
    })
    if (excluiu) location.href = "../auth/auth.html"
})

if (eu) carregarFamilia()
