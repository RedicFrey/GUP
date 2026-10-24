import { selectTasksApi, reviewTaskApi } from '../api/task-api.js'
import { renderDashboardTasks } from './task-render.js'

async function loadTasksPage(params) {
    const response = await selectTasksApi(params)
    if (!response) return null
    return { items: response.tasks ?? [], total: response.total ?? 0 }
}

export function showTasks(childId, status, container, profile_type, onChanged, options = {}) {
    return renderDashboardTasks(
        (page, size) => loadTasksPage({ status, childProfileId: childId, page, size }),
        container,
        profile_type,
        (assignment, approve) => reviewTask(assignment, approve, onChanged),
        options
    )
}

export async function reviewTask(assignment, approve, onChanged) {
    const reviewed = await reviewTaskApi(assignment.assignment_id, approve)
    if (!reviewed) return

    onChanged?.()
}
