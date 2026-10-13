import { selectTasksApi, submitTaskProofApi, reviewTaskApi } from './task_api.js'
import { renderDashboardTasks } from './task_render.js'

// Busca as tarefas e desenha a lista
export async function showTasks(childId, status, container, profile_type, onChanged) {
    const response = await selectTasksApi({ status, childProfileId: childId })
    if (!response) return

    renderDashboardTasks(response, container, profile_type, {
        onSendProof: (assignment, file) => sendTaskProof(assignment, file, onChanged),
        onReview: (assignment, approve) => reviewTask(assignment, approve, onChanged),
        onChanged,   // usado pelo modal de detalhes (editar/deletar) para recarregar a lista
    })
}

export async function sendTaskProof(assignment, file, onChanged) {
    const formData = new FormData()
    if (file) formData.append("foto_comprovacao", file)

    const updated = await submitTaskProofApi(assignment.assignment_id, formData)
    if (!updated) return

    onChanged?.()
}

export async function reviewTask(assignment, approve, onChanged) {
    const reviewed = await reviewTaskApi(assignment.assignment_id, approve)
    if (!reviewed) return

    onChanged?.()
}
