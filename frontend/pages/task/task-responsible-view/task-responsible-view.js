import { loadFamilyContext } from '../../../utils/family-context.js'
import { escapeHtml } from '../../../utils/escape-html.js'
// ajuste os caminhos abaixo para onde cada um realmente está
import { getTaskApi, deleteTaskApi } from './task_api.js'
import { editTask } from '../dialog/edit_task.js'
import { warning } from '../../../js/generic/warning.js'
import { formatarDataEHorario } from './task_utils.js'
import { pageUrl } from '../../../services/api.js'

const taskInfo = document.querySelector('.task-info-content')
const taskId = new URLSearchParams(window.location.search).get("task_id")

const LIST_PAGE = "tarefas.html"   

async function init() {
    if (!taskId) {
        taskInfo.textContent = "Tarefa não informada."
        return
    }

    const ctx = await loadFamilyContext()
    if (!ctx.isResponsible) {
        window.location.href = pageUrl("pages/home/dashboard.html")
        return
    }

    await showTaskInfo()
}

async function showTaskInfo() {
    const resposta = await getTaskApi({ taskId })
    const task = resposta?.tasks ?? resposta

    if (!task || !task.name) {
        taskInfo.textContent = "Não foi possível pegar a tarefa."
        return
    }

    // o back pode mandar child_profile_id ou child_id
    const childIdOf = (child) => child.child_profile_id ?? child.child_id

    const childUrl = (child) => {
        const params = new URLSearchParams({
            task_id: taskId,
            assignment_id: child.assignment_id,
            child_profile_id: childIdOf(child),
        })
        return `tarefa_crianca.html?${params}`
    }

    const childrenHtml = (task.children ?? []).map((child) => `
        <li>
            ${escapeHtml(child.name)} (${escapeHtml(child.status)})
            <a class="btn-view-child" href="${escapeHtml(childUrl(child))}">Ver</a>
        </li>
    `).join("")

    taskInfo.innerHTML = `
        <h2>${escapeHtml(task.name)}</h2>
        <div id="responsible-options">
            <button type="button" data-action="edit">Editar</button>
            <button type="button" data-action="delete">Deletar</button>
        </div>
        <p>${escapeHtml(task.description || "Sem descrição")}</p>
        <p><strong>Prazo:</strong> ${escapeHtml(formatarDataEHorario(task.deadline))}</p>
        <p><strong>Moedas:</strong> ${escapeHtml(task.coins_reward)}</p>
        <p><strong>XP:</strong> ${escapeHtml(task.xp_reward)}</p>
        <p><strong>Foto obrigatória:</strong> ${task.required_proof ? "Sim" : "Não"}</p>
        <h3>Para:</h3>
        <ul id="task-children-list">${childrenHtml}</ul>
    `

    const actions = {
        edit: () => openEditDialog(task),
        delete: async () => {
            const confirmed = await warning(`Deseja realmente deletar a tarefa "${task.name}"?`)
            if (!confirmed) return

            const deleted = await deleteTaskApi(taskId)
            if (!deleted) return

            window.location.href = LIST_PAGE
        },
    }

    taskInfo.querySelector("#responsible-options").addEventListener("click", (event) => {
        const btn = event.target.closest("[data-action]")
        if (btn) actions[btn.dataset.action]?.()
    })
}

function openEditDialog(task) {
    const dialog = document.createElement("dialog")
    document.body.append(dialog)
    dialog.addEventListener("close", () => dialog.remove())
    dialog.showModal()

    editTask(
        dialog,
        task,
        "responsible",                       
        () => dialog.close(),                  
        () => { dialog.close(); showTaskInfo() },    
    )
}

init()