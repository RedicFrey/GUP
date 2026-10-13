import { showTasks } from '../core/task_actions.js'
import { createTask } from '../dialog/create.js'
import { setFamilyChildren } from '../dialog/task_modal.js'
import { createTaskFilter } from '../core/task_filter.js'
import { isResponsible } from '../core/task_utils.js'
import { familyChildren } from '../../../generic/utils.js'
import { withoutChildren } from '../../../generic/warning.js'

export async function dashboardTask(taskSection, childId, profile_type, familyChildrens) {
    // fazer uma função para substituir isso
    const children = await familyChildren()
    if (children.length == 0){
        withoutChildren(taskSection)
        return
    }

    const responsible = isResponsible(profile_type)

    const divTasks = document.createElement("div")
    divTasks.id="div-list-task-dashboard"

    const modalTask = document.createElement("dialog")
    modalTask.id = "modal-task"

    const filter = createTaskFilter({
        isResponsible: responsible,
        childId,
        familyChildrens,
        onChange: () => recarregar(),
    })

    function recarregar() {
        const { childId: selectedChildId, status } = filter.getState()
        showTasks(selectedChildId, status, divTasks, profile_type, recarregar)
    }

    const viewTaskButton = document.createElement("button")
    viewTaskButton.textContent = 'Ver tarefas'
    viewTaskButton.addEventListener("click", (e) => {
        window.location.href="task.html"
    })

    if (responsible) {
        setFamilyChildren(familyChildrens)

        const btnCreateTask = document.createElement("button")
        btnCreateTask.textContent = "Criar tarefa"
        btnCreateTask.id = "btn-create-task"
        btnCreateTask.classList.add("btn-create");
        btnCreateTask.addEventListener("click", (e) => {
            e.preventDefault()
            createTask({ dialog: modalTask, familyChildrens, profile_type, onSaved: recarregar })
        })

        taskSection.append(btnCreateTask)
    } 
    taskSection.append(filter.element, divTasks, modalTask)

    recarregar()
}
