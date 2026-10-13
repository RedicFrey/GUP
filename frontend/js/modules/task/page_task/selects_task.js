
import { getTaskApi } from '../core/task_api.js'
import { renderTasksList } from '../core/task_render.js'
import { showTaskInfo } from '../dialog/selects_task.js'

export async function selectAllTaskToday(container, dialog, profile_type) {
    await baseSelectTask(container, dialog, profile_type, "today")
}

export async function selectAllTaskNext(container, dialog, profile_type) {
    await baseSelectTask(container, dialog, profile_type, "after")
}

export async function selectAllTaskRepeated(container) {
    renderTasksList([], container)   // limpa a lista e o "Mostrar mais" da aba anterior
}

async function baseSelectTask(container, dialog, profile_type, period) {
    try {
        const resultado = await getTaskApi({ type: period })
        if (!resultado) return

        const tasks = Array.isArray(resultado) ? resultado : (resultado.tasks ?? [])
        const recarregar = () => baseSelectTask(container, dialog, profile_type, period)

        renderTasksList(tasks, container, {
            profile_type,
            onInfoClick: ({ task_id }) => showTaskInfo(dialog, task_id, profile_type, recarregar),
        })
    } catch (err) {
        console.error(err)
    }
}
