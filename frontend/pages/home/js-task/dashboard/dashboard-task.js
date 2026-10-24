import { showTasks } from './task-actions.js'
import { createTaskFilter } from './task-filter.js'
import { createTask } from '../dialog/create-task-dialog.js'
import { openTasksDialog } from '../dialog/tasks-dialog.js'
import { isResponsible } from '../shared/task-utils.js'
import { withoutChildren } from '../../../../components/confirm-modal/confirm-modal.js'
import { familyChildren } from '../../../../utils/family-children.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'

// Monta a seção de tarefas do perfil.
// familyContainer -> onde desenhar os cartões da família (só responsável)
// onChanged       -> chamado quando uma tarefa é criada/aprovada/recusada
// Devolve o filtro ({ getState, setStatus, reload }) ou null se não há crianças.
export async function dashboardTask(taskSection, childId, profile_type, { familyContainer, onChanged } = {}) {
    const divCreateTask = taskSection.querySelector('.div-create-task')
    const taskFilters = taskSection.querySelector('.task-filters')
    const taskList = taskSection.querySelector('.task-list')

    const children = (await familyChildren()) ?? []
    const responsible = isResponsible(profile_type)

    if (children.length === 0) {
        familyContainer?.remove()
        withoutChildren(taskSection)
        return null
    }

    const childrenById = new Map(children.map((c) => [String(c.id), c]))

    const modalTask = document.createElement("dialog")
    modalTask.id = "modal-task"
    const tasksDialog = document.createElement("dialog")
    tasksDialog.id = "tasks-dialog"
    document.body.append(modalTask, tasksDialog)

    const filter = createTaskFilter({
        isResponsible: responsible,
        childId,
        familyChildren: children,
        onChange: () => reload(),
        onViewTasks: () => openTasksDialog({ dialog: tasksDialog, profile_type, childId }),
        container: taskFilters,
        familyContainer,
    })

    function reload() {
        const { childId: selectedChildId, status } = filter.getState()
        showTasks(selectedChildId, status, taskList, profile_type, () => {
            reload()
            onChanged?.()
        }, { childrenById })
    }

    if (responsible) {
        const btnCreateTask = document.createElement("button")
        btnCreateTask.type = "button"
        btnCreateTask.innerHTML = `${pixelIcon("plus", { size: 14 })} Nova tarefa`
        btnCreateTask.id = "btn-create-task"
        btnCreateTask.classList.add("btn-create")
        btnCreateTask.addEventListener("click", (e) => {
            e.preventDefault()
            createTask({
                dialog: modalTask,
                familyChildren: children,
                profile_type,
                preselected: filter.getState().childId,
                onSaved: () => { reload(); onChanged?.() },
            })
        })
        divCreateTask.append(btnCreateTask)
    }

    reload()
    return { ...filter, reload }
}
