import { apiFetch, showMessage, goToLogin } from '../../../../services/api.js'

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
    const { ok, status, dados } = options ? await apiFetch(path, options) : await apiFetch(path)

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

// GET /tarefas/listar
export function selectTasksApi({ status, period, childProfileId, page, size } = {}) {
    return call(
        `/tarefas/listar${buildQuery({ status, period, child_profile_id: childProfileId, page, size })}`,
        "Erro ao carregar tarefas."
    )
}

export function getTaskApi({ taskId = null, type = null, page, size } = {}) {
    const path = taskId ? `/tarefas/${taskId}` : `/tarefas`
    return call(`${path}${buildQuery({ type, page, size })}`, "Erro ao carregar tarefa.")
}

// GET /tarefas/crianca
export function selectTasksByChildApi({ childProfileId, taskAssignmentId } = {}) {
    return call(
        `/tarefas/crianca${buildQuery({
            child_profile_id: childProfileId,
            task_assignment_id: taskAssignmentId,
        })}`,
        "Erro ao carregar tarefa da criança."
    )
}

// ---------- Escritas (devolvem true/false) ----------

export async function updateTaskApi(taskId, changes, messageElement) {
    const r = await call(`/tarefas/${taskId}/editar`, "Não foi possível salvar as alterações da tarefa.", { method: "PATCH", body: changes }, messageElement)
    return r !== null
}

export async function deleteTaskApi(taskId) {
    const r = await call(`/tarefas/${taskId}/deletar`, "Erro ao deletar tarefa.", { method: "DELETE" })
    return r !== null
}

// ---------- Aprovação ----------

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
