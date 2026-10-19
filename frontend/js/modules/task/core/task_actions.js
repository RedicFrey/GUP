import { selectTasksApi, submitTaskProofApi, reviewTaskApi } from './task_api.js'
import { renderDashboardTasks } from './task_render.js'

// Busca as tarefas e desenha a lista
async function loadTasksPage(params) {
    const response = await selectTasksApi(params)
    if (!response) return null
    return { items: response.tasks ?? [], total: response.total ?? 0 }
}

export async function showTasks(childId, status, container, profile_type, onChanged) {
    await renderDashboardTasks(
        (page, size) => loadTasksPage({ status, childProfileId: childId, page, size }),
        container,
        profile_type,
        {
            onSendProof: (assignment, file) => sendTaskProof(assignment, file, onChanged),
            onReview: (assignment, approve) => reviewTask(assignment, approve, onChanged),
            onChanged,
        }
    )
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
