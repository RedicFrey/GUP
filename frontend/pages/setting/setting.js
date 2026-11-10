// ============================================================
// setting.js -> página "Configurações"
// ============================================================
// A página já está toda no HTML. Aqui só:
//   - coloca o nome, o avatar e a girafa
//   - salva o nome e o PIN
//   - carrega e salva as notificações (só responsável)

import { api, mostrarMensagem } from "../../services/api.js"
import { meuPerfil, nomeDoPapel, avatar } from "../../services/perfil.js"
import { cenaHtml } from "../../components/giraffe/giraffe.js"

const perfil = await meuPerfil()


// ---------- Quem está logado ----------
document.querySelector("#eu-avatar").innerHTML = avatar(perfil, "avatar-g")
document.querySelector("#eu-nome").textContent = perfil.name
document.querySelector("#eu-papel").textContent = nomeDoPapel(perfil)
document.querySelector("#nome").value = perfil.name
document.querySelector("#remover-pin").hidden = !perfil.has_pin


// ---------- Nome e PIN ----------
// PUT /perfis-conta-familia/atualizar-perfil/<id> mandando só o que mudou
function salvarPerfil(campos, mensagem) {
    return api(`/perfis-conta-familia/atualizar-perfil/${perfil.id}`, {
        method: "PUT",
        body: { id: perfil.id, ...campos },
        mensagem,
    })
}

document.querySelector("#form-nome").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const mensagem = document.querySelector("#nome-mensagem")
    if (await salvarPerfil({ name: document.querySelector("#nome").value.trim() }, mensagem)) {
        mostrarMensagem(mensagem, "Nome salvo.", "sucesso")
    }
})

document.querySelector("#form-pin").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const mensagem = document.querySelector("#pin-mensagem")
    if (await salvarPerfil({ pin: document.querySelector("#pin").value.trim() }, mensagem)) location.reload()
})

// remover = mandar pin: null
document.querySelector("#remover-pin").addEventListener("click", async () => {
    if (!confirm("Remover o PIN? Qualquer pessoa da família vai poder entrar neste perfil.")) return
    if (await salvarPerfil({ pin: null }, document.querySelector("#pin-mensagem"))) location.reload()
})


// ---------- Girafa (criança) ----------
if (perfil.profile_type === "child") {
    const girafa = await api("/girafas/me")
    if (girafa) document.querySelector("#mini-girafa").innerHTML = cenaHtml(girafa)
}


// ---------- Notificações (responsável) ----------
// GET /notificacoes/permitidas -> { email, permissions: { tasks: true, ... } }
// PUT /notificacoes/permitidas/atualizar com { email } ou { permissions: { tasks: false } }
if (perfil.profile_type === "responsible") {
    const dados = await api("/notificacoes/permitidas")
    if (dados) {
        document.querySelector("#email").value = dados.email ?? ""
        document.querySelectorAll(".switch").forEach((interruptor) => {
            interruptor.checked = Boolean(dados.permissions[interruptor.dataset.chave])
        })
    }
}

// e-mail vazio = não quer receber (manda null)
document.querySelector("#form-email").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const mensagem = document.querySelector("#email-mensagem")
    const email = document.querySelector("#email").value.trim() || null
    if (await api("/notificacoes/permitidas/atualizar", { method: "PUT", body: { email }, mensagem })) {
        mostrarMensagem(mensagem, "E-mail salvo.", "sucesso")
    }
})

// ligou/desligou um interruptor: salva na hora
document.querySelector("#interruptores").addEventListener("change", async (evento) => {
    const interruptor = evento.target
    const salvou = await api("/notificacoes/permitidas/atualizar", {
        method: "PUT",
        body: { permissions: { [interruptor.dataset.chave]: interruptor.checked } },
    })
    if (!salvou) interruptor.checked = !interruptor.checked   // deu erro: volta como estava
})
