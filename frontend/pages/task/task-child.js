// ============================================================
// task-child.js -> tela da tarefa (visão da criança)
// ============================================================
// A criança vê a tarefa e manda a foto (ou só avisa que fez).
// Endereço: task-children-view.html?assignment_id=12

import { api } from "../../services/api.js"
import { situacao, fotoUrl, preencherDetalhes } from "../../utils/tarefas.js"

const idAtribuicao = new URLSearchParams(location.search).get("assignment_id")
const formulario = document.querySelector("#form-envio")
const campoArquivo = document.querySelector("#arquivo")
const previa = document.querySelector("#previa")
const botaoEnviar = document.querySelector("#enviar")


// GET /tarefas/crianca?task_assignment_id=12 -> { tasks: {...} }
async function carregarTarefa() {
    const resposta = await api(`/tarefas/crianca?task_assignment_id=${idAtribuicao}`)
    const tarefa = resposta?.tasks
    if (!tarefa) return
    preencherDetalhes(tarefa)

    const { chave, texto } = situacao(tarefa)
    const etiqueta = document.querySelector("#tarefa-situacao")
    etiqueta.textContent = texto
    etiqueta.className = `tag tag-${chave}`

    // mostra só o painel que combina com o status
    document.querySelector("#painel-feita").hidden = tarefa.status !== "done"
    document.querySelector("#painel-espera").hidden = tarefa.status !== "awaiting_approval"
    formulario.hidden = tarefa.status !== "pending"

    if (tarefa.proof_photo) {
        const foto = document.querySelector("#foto-enviada")
        foto.src = fotoUrl(tarefa.proof_photo)
        foto.hidden = false
    }

    // com foto obrigatória, o botão só libera depois de escolher a foto
    const precisaFoto = Boolean(Number(tarefa.required_proof))
    document.querySelector("#aviso-foto").textContent = precisaFoto ? "Essa tarefa precisa de foto para ser aprovada." : "A foto é opcional."
    botaoEnviar.disabled = precisaFoto
}

// Escolheu a foto: mostra a prévia e libera o botão
campoArquivo.addEventListener("change", () => {
    previa.src = URL.createObjectURL(campoArquivo.files[0])   // endereço temporário só para ver a foto
    previa.hidden = false
    botaoEnviar.disabled = false
})

// POST /tarefas/<id>/comprovacao com a foto num FormData (campo "foto_comprovacao")
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault()
    const dados = new FormData()
    if (campoArquivo.files[0]) dados.append("foto_comprovacao", campoArquivo.files[0])

    botaoEnviar.disabled = true
    if (await api(`/tarefas/${idAtribuicao}/comprovacao`, { method: "POST", body: dados })) carregarTarefa()
    botaoEnviar.disabled = false
})

carregarTarefa()
