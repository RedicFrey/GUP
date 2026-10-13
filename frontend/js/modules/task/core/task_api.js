
function showError(text) {
    const el = document.querySelector("#mensagem")
    if (el) mostrarMensagem(el, text, "erro")
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
async function call(path, errorMessage, options) {
    const { ok, status, dados } = options ? await apiFetch(path, options) : await apiFetch(path)

    if (status === 401) {
        window.location.href = "auth.html"
        return null
    }
    if (!ok) {
        showError(dados?.erro || errorMessage)
        return null
    }
    return dados ?? {}
}

// ---------- Leituras ----------

// GET /tarefas/listar
export function selectTasksApi({ status, period, childProfileId } = {}) {
    return call(
        `/tarefas/listar${buildQuery({ status, period, child_profile_id: childProfileId })}`,
        "Erro ao carregar tarefas."
    )
}

// GET /tarefas/<task_id>  (ou /tarefas?type=today|after)
export function getTaskApi({ taskId = null, type = null } = {}) {
    const path = taskId ? `/tarefas/${taskId}` : `/tarefas`
    return call(`${path}${buildQuery({ type })}`, "Erro ao carregar tarefa.")
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

export async function createTaskApi(data) {
    const r = await call("/tarefas/criar", "Erro ao criar tarefa.", { method: "POST", body: data })
    return r !== null
}

export async function updateTaskApi(taskId, changes) {
    const r = await call(`/tarefas/${taskId}/editar`, "Erro ao alterar tarefa.", { method: "PATCH", body: changes })
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
