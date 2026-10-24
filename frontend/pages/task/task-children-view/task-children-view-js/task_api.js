import { apiFetch, showMessage, goToLogin } from '../../../../services/api.js'

function showError(text) {
    const el = document.querySelector("#mensagem")
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

async function call(path, errorMessage, options) {
    const { ok, status, dados } = options ? await apiFetch(path, options) : await apiFetch(path)

    if (status === 401) {
        goToLogin(dados?.erro)
        return null
    }
    if (!ok) {
        showError(dados?.erro || errorMessage)
        return null
    }
    return dados ?? {}
}

// -- Leituras --
export function selectTasksByChildApi({ childProfileId, taskAssignmentId } = {}) {
    return call(
        `/tarefas/crianca${buildQuery({
            child_profile_id: childProfileId,
            task_assignment_id: taskAssignmentId,
        })}`,
        "Erro ao carregar tarefa da criança."
    )
}

// -- Aprovação --
export function submitTaskProofApi(assignmentId, formData) {
    return call(`/tarefas/${assignmentId}/comprovacao`, "Erro ao enviar comprovação.", {
        method: "POST",
        body: formData,
    })
}

export function reviewTaskApi(assignmentId, approve) {
    const action = approve ? "aprovar" : "reprovar"
    return call(`/tarefas/${assignmentId}/${action}`, "Erro ao avaliar tarefa.", { method: "POST" })
}
