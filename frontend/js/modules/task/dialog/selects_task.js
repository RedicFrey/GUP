import { warning } from '../../../generic/warning.js'
import { editTask } from './update.js'
import { getTaskApi, deleteTaskApi } from '../core/task_api.js'
import { escapeHtml, isResponsible } from '../core/task_utils.js'

// Detalhes da tarefa. Editar e Deletar só aparecem (e só funcionam) para o responsável.
export async function showTaskInfo(dialog, taskId, profile_type, onChanged) {
    const responsible = isResponsible(profile_type)

    dialog.innerHTML = `
        <div>
            <button type="button" id="close-dialog-task-info">X</button>
        </div>
        <div id="task-info-content">Carregando...</div>
    `
    dialog.querySelector("#close-dialog-task-info")
        .addEventListener("click", () => dialog.close())

    if (!dialog.open) dialog.showModal()

    const content = dialog.querySelector("#task-info-content")

    const resposta = await getTaskApi({ taskId })
    const task = resposta?.tasks ?? resposta

    if (!task || !task.name) {
        content.textContent = "Não foi possível pegar a tarefa."
        return
    }

    // o back pode mandar child_profile_id ou child_id
    const childIdOf = (child) => child.child_profile_id ?? child.child_id

    const childrenHtml = (task.children ?? []).map((child) => `
        <li>
            ${escapeHtml(child.name)} (${escapeHtml(child.status)})
            <button type="button" class="btn-view-child"
                data-assignment-id="${escapeHtml(child.assignment_id)}"
                data-child-id="${escapeHtml(childIdOf(child))}">Ver</button>
        </li>
    `).join("")

    const responsibleHtml = responsible ? `
        <div id="responsible-options">
            <button type="button" data-action="edit">Editar</button>
            <button type="button" data-action="delete">Deletar</button>
        </div>` : ''

    content.innerHTML = `
        <h2>${escapeHtml(task.name)}</h2>
        ${responsibleHtml}
        <p>${escapeHtml(task.description || "Sem descrição")}</p>
        <p><strong>Prazo:</strong> ${escapeHtml(formatarDataEHorario(task.deadline))}</p>
        <p><strong>Moedas:</strong> ${escapeHtml(task.coins_reward)}</p>
        <p><strong>XP:</strong> ${escapeHtml(task.xp_reward)}</p>
        <p><strong>Foto obrigatória:</strong> ${task.required_proof ? "Sim" : "Não"}</p>
        <h3>Para:</h3>
        <ul id="task-children-list">${childrenHtml}</ul>
    `

    const onBack = () => showTaskInfo(dialog, taskId, profile_type, onChanged)

    if (responsible) {
        const actions = {
            edit: () => editTask(dialog, task, profile_type, onBack, onChanged),
            delete: async () => {
                const confirmed = await warning(`Deseja realmente deletar a tarefa "${task.name}"?`)
                if (!confirmed) return

                const deleted = await deleteTaskApi(taskId)
                if (!deleted) return

                dialog.close()
                onChanged?.()
            },
        }

        content.querySelector("#responsible-options").addEventListener("click", (event) => {
            const btn = event.target.closest("[data-action]")
            if (btn) actions[btn.dataset.action]?.()
        })
    }

    content.querySelector("#task-children-list").addEventListener("click", (event) => {
        const btn = event.target.closest(".btn-view-child")
        if (!btn) return

        showChildrenTask(dialog, {
            assignmentId: btn.dataset.assignmentId,
            childProfileId: btn.dataset.childId,
            taskId,
        }, profile_type, onChanged)
    })
}