
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
    // sem tarefas repetidas ainda: limpa a lista e o "Mostrar mais" da aba anterior
    await renderTasksList(async () => ({ items: [], total: 0 }), container)
}

async function baseSelectTask(container, dialog, profile_type, period) {
    try {
        const recarregar = () => baseSelectTask(container, dialog, profile_type, period)

        const loadPage = async (page, size) => {
            const resultado = await getTaskApi({ type: period, page, size })
            if (!resultado) return null
            return { items: resultado.tasks ?? [], total: resultado.total ?? 0 }
        }

        await renderTasksList(loadPage, container, {
            profile_type,
            onInfoClick: ({ task_id }) => showTaskInfo(dialog, task_id, profile_type, recarregar),
        })
    } catch (err) {
        console.error(err)
    }
}
