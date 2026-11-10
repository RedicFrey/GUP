// ============================================================
// tarefas.js -> coisas de tarefa usadas em mais de uma página
// ============================================================
// A lista de tarefas (perfil) e as duas telas de tarefa usam as mesmas
// regras. Ficam aqui para não ter a mesma função copiada em 3 lugares.

import { imagemDoBackend } from "../services/api.js"
import { avatar } from "../services/perfil.js"
import { escapeHtml, passou, dataHora } from "./formatar.js"

// Link para a tela de uma tarefa de UMA criança (a "atribuição" dela)
export function linkTarefaCrianca(tarefa) {
    return `../task/task-children-view.html?assignment_id=${tarefa.assignment_id}`
}

// Situação da tarefa: "chave" vira a cor (classe CSS tag-pending, tag-late...)
// e "texto" é o que aparece escrito
export function situacao(tarefa) {
    if (tarefa.status === "pending" && passou(tarefa.deadline)) return { chave: "late", texto: "Atrasada" }
    if (tarefa.status === "awaiting_approval") return { chave: "awaiting", texto: "Em espera" }
    if (tarefa.status === "done") return { chave: "done", texto: "Concluída" }
    if (tarefa.status === "not_done") return { chave: "late", texto: "Não feita" }
    return { chave: "pending", texto: "Pendente" }
}

// O backend guarda a foto como "uploads/proofs/abc.png" (dentro de /static)
export function fotoUrl(caminho) {
    const limpo = caminho.replace(/\\/g, "/")
    return imagemDoBackend(limpo.startsWith("static/") ? limpo : "static/" + limpo)
}


// ---------- formulário de criar / editar tarefa ----------
// O formulário está escrito no HTML (dentro do <dialog id="dialogo-tarefa">).
// Aqui só tem o que depende dos dados: as crianças e os valores.

// Coloca uma caixinha para cada criança. "marcadas" = ids que já começam marcados
export function preencherFormularioTarefa(criancas, tarefa = null) {
    const marcadas = tarefa ? tarefa.children.map((c) => c.child_profile_id) : []

    document.querySelector("#tarefa-criancas").innerHTML = criancas.map((crianca) => `
        <label class="pick">
            <input type="checkbox" name="crianca" value="${crianca.id}" ${marcadas.includes(crianca.id) ? "checked" : ""}>
            ${avatar(crianca, "avatar-pp")}
            ${escapeHtml(crianca.name)}
        </label>`).join("")

    // nome, descrição, prazo e foto vão pelo .value (assim aspas no texto não quebram nada)
    document.querySelector("#tarefa-nome").value = tarefa?.name ?? ""
    document.querySelector("#tarefa-descricao").value = tarefa?.description ?? ""
    document.querySelector("#tarefa-prazo").value = tarefa?.deadline.slice(0, 16) ?? ""   // "2026-10-23T18:00"
    document.querySelector("#tarefa-foto").checked = Boolean(tarefa?.required_proof)
    const dificuldade = document.querySelector(`input[name="dificuldade"][value="${tarefa?.coins_reward ?? 10}"]`)
    if (dificuldade) dificuldade.checked = true
}

// Lê os campos e devolve no formato que a API espera
export function lerFormularioTarefa() {
    return {
        name: document.querySelector("#tarefa-nome").value.trim(),
        description: document.querySelector("#tarefa-descricao").value.trim(),
        deadline: document.querySelector("#tarefa-prazo").value,
        requiredProof: document.querySelector("#tarefa-foto").checked,
        childrenIds: [...document.querySelectorAll('input[name="crianca"]:checked')].map((c) => Number(c.value)),
        coinsReward: Number(document.querySelector('input[name="dificuldade"]:checked').value),
        xpReward: 15,   // toda dificuldade vale 15 de XP
    }
}


// ---------- cartão de detalhes (as duas telas de tarefa usam) ----------
// O HTML já tem os campos com id; aqui só coloca os textos
export function preencherDetalhes(tarefa) {
    document.title = `${tarefa.name} - GUP`
    document.querySelector("#tarefa-titulo").textContent = tarefa.name
    document.querySelector("#tarefa-detalhes").textContent = tarefa.description || "Sem detalhes."
    document.querySelector("#tarefa-prazo-texto").textContent = dataHora(tarefa.deadline)
    document.querySelector("#tarefa-moedas").textContent = `+${tarefa.coins_reward}`
    document.querySelector("#tarefa-xp").textContent = `+${tarefa.xp_reward} XP`
    document.querySelector("#tarefa-foto-texto").textContent = Number(tarefa.required_proof) ? "Obrigatória" : "Opcional"
}
