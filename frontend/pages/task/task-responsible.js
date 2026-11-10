// ============================================================
// task-responsible.js -> tela de uma tarefa (visão do responsável)
// ============================================================
// Mostra a tarefa e uma linha para cada criança que vai fazer.
// Daqui o responsável edita, exclui, vê a foto e aprova ou recusa.
// Endereço: task-responsible-view.html?task_id=5

import { api } from "../../services/api.js"
import { criancasDaFamilia, avatar } from "../../services/perfil.js"
import { escapeHtml } from "../../utils/formatar.js"
import { situacao, fotoUrl, preencherDetalhes, preencherFormularioTarefa, lerFormularioTarefa } from "../../utils/tarefas.js"

const idDaTarefa = new URLSearchParams(location.search).get("task_id")   // pega o ?task_id= do endereço
const quemFaz = document.querySelector("#quem-faz")
let tarefa = null


// GET /tarefas/<id> -> a tarefa com a lista "children" (uma linha por criança)
async function carregarTarefa() {
    tarefa = await api(`/tarefas/${idDaTarefa}`)
    if (!tarefa) return
    preencherDetalhes(tarefa)

    quemFaz.innerHTML = tarefa.children.map((filho) => {
        const { chave, texto } = situacao({ ...filho, deadline: tarefa.deadline })
        const id = filho.assignment_id

        // botões de avaliar só aparecem quando a criança já enviou
        const avaliar = filho.status === "awaiting_approval" ? `
            <button type="button" class="btn btn-sm btn-danger" data-acao="reprovar" data-id="${id}">Recusar</button>
            <button type="button" class="btn btn-sm btn-success" data-acao="aprovar" data-id="${id}">Aprovar</button>` : ""
        const foto = filho.proof_photo
            ? `<button type="button" class="btn btn-sm btn-ghost" data-foto="${escapeHtml(filho.proof_photo)}"><i class="icone i-camera"></i> Foto</button>` : ""

        return `
            <li class="assignee">
                ${avatar({ id: filho.child_profile_id })}
                <span class="assignee-name">${escapeHtml(filho.name)}</span>
                <span class="tag tag-${chave}">${texto}</span>
                ${foto}${avaliar}
            </li>`
    }).join("")
}

// Cliques nas linhas das crianças
quemFaz.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("button")
    if (!botao) return

    if (botao.dataset.foto) {
        document.querySelector("#foto-grande").src = fotoUrl(botao.dataset.foto)
        document.querySelector("#dialogo-foto").showModal()
        return
    }

    // POST /tarefas/<id>/aprovar  ou  /tarefas/<id>/reprovar
    botao.disabled = true
    if (await api(`/tarefas/${botao.dataset.id}/${botao.dataset.acao}`, { method: "POST" })) carregarTarefa()
    botao.disabled = false
})


// Editar: abre a janelinha já preenchida com a tarefa
document.querySelector("#editar").addEventListener("click", async () => {
    preencherFormularioTarefa(await criancasDaFamilia(), tarefa)
    document.querySelector("#dialogo-tarefa").showModal()
})

// PATCH /tarefas/<id>/editar
document.querySelector("#form-tarefa").addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const salvou = await api(`/tarefas/${idDaTarefa}/editar`, {
        method: "PATCH",
        body: lerFormularioTarefa(),
        mensagem: document.querySelector("#tarefa-mensagem"),
    })
    if (!salvou) return
    document.querySelector("#dialogo-tarefa").close()
    carregarTarefa()
})


// DELETE /tarefas/<id>/deletar -> depois volta para o perfil
document.querySelector("#excluir").addEventListener("click", async () => {
    // confirm() é a caixinha de "OK / Cancelar" do próprio navegador
    if (!confirm(`Excluir a tarefa "${tarefa.name}"? Ela some para todas as crianças.`)) return
    if (await api(`/tarefas/${idDaTarefa}/deletar`, { method: "DELETE" })) location.href = "../home/dashboard.html"
})

carregarTarefa()
