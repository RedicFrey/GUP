import { apiFetch, showMessage, goToLogin } from './api.js'

// Chamadas da API de tarefas, usadas pelo painel, pela tela do responsável e pela da criança.

// Mostra o erro no elemento indicado; sem elemento, usa o #mensagem da página
function showError(text, element) {
    const el = element ?? document.querySelector("#mensagem")
    if (el) showMessage(el, text, "erro")
    else alert(text)
}

function buildQuery(params) {
    const q = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== "") q.set(key, value)
    }
    const s = q.toString()
    return s ? `?${s}` : ""
}

// Trata 401 e erro em um lugar só. Devolve os dados, ou null se falhou.
async function call(path, errorMessage, options, messageElement) {
    const { ok, status, dados } = await apiFetch(path, options)

    if (status === 401) {
        goToLogin(dados?.erro)
        return null
    }
    if (!ok) {
        showError(dados?.erro || errorMessage, messageElement)
        return null
    }
    return dados ?? {}
}

// ---------- Leituras ----------

// GET /tarefas/listar: uma linha por criança, com filtros
export function selectTasksApi({ status, period, childProfileId, page, size } = {}) {
    return call(
        `/tarefas/listar${buildQuery({ status, period, child_profile_id: childProfileId, page, size })}`,
        "Erro ao carregar tarefas."
    )
}

// GET /tarefas ou /tarefas/<id>: tarefa com as crianças de cada uma
export function getTaskApi({ taskId = null, type = null, page, size } = {}) {
    const path = taskId ? `/tarefas/${taskId}` : `/tarefas`
    return call(`${path}${buildQuery({ type, page, size })}`, "Erro ao carregar tarefa.")
}

// GET /tarefas/crianca: detalhe da tarefa de uma criança
export function selectTasksByChildApi({ childProfileId, taskAssignmentId } = {}) {
    return call(
        `/tarefas/crianca${buildQuery({
            child_profile_id: childProfileId,
            task_assignment_id: taskAssignmentId,
        })}`,
        "Erro ao carregar tarefa da criança."
    )
}

// Contagem rápida (só o total) para os números do perfil
export async function countTasksApi(params = {}) {
    const { ok, dados } = await apiFetch(
        `/tarefas/listar${buildQuery({ ...params, page: 1, size: 1 })}`
    )
    return ok ? (dados?.total ?? 0) : null
}

// ---------- Escritas (devolvem true/false) ----------

export async function createTaskApi(data, messageElement) {
    const r = await call("/tarefas/criar", "Erro ao criar tarefa.", { method: "POST", body: data }, messageElement)
    return r !== null
}

export async function updateTaskApi(taskId, changes, messageElement) {
    const r = await call(`/tarefas/${taskId}/editar`, "Não foi possível salvar as alterações da tarefa.",
        { method: "PATCH", body: changes }, messageElement)
    return r !== null
}

export async function deleteTaskApi(taskId) {
    const r = await call(`/tarefas/${taskId}/deletar`, "Erro ao deletar tarefa.", { method: "DELETE" })
    return r !== null
}

// ---------- Envio e aprovação ----------

// formData já vem com o campo "foto_comprovacao"
export function submitTaskProofApi(assignmentId, formData) {
    return call(`/tarefas/${assignmentId}/comprovacao`, "Erro ao enviar comprovação.", {
        method: "POST",
        body: formData,
    })
}

// approve = true -> /aprovar | false -> /reprovar
export function reviewTaskApi(assignmentId, approve) {
    const action = approve ? "aprovar" : "reprovar"
    return call(`/tarefas/${assignmentId}/${action}`, "Erro ao avaliar tarefa.", { method: "POST" })
}
