import { sideBar } from '../../../../components/sidebar/sidebar.js'
import { warning } from '../../../../components/confirm-modal/confirm-modal.js'
import { avatar } from '../../../../components/avatar/avatar.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'
import { editTask } from './update.js'
import { prazoCurto, formatarDataEHorario } from '../../../../utils/formatar.js'
import { getTaskApi, deleteTaskApi } from './task-responsible-api.js'
import { escapeHtml, isResponsible, statusLabel } from './task-utils.js'
import { loadMyProfile } from '../../../../services/perfil-service.js'
import { PAGES, pageUrl } from '../../../../services/api.js'

const CHILD_PAGE = pageUrl("pages/task/task-children-view/task-children-view.html")
const STATUS_TAG = { pending: "pending", awaiting_approval: "awaiting", done: "done", not_done: "late" }

const childTaskContainer = document.querySelector('.task-container')
const params = new URLSearchParams(window.location.search)
const taskId = params.get("task_id")

sideBar()

export async function showTaskInfo() {
    const me = await loadMyProfile()
    const responsible = isResponsible(me?.profile_type)

    if (!taskId) {
        childTaskContainer.innerHTML = `<div class="empty"><p>Nenhuma tarefa foi escolhida.</p></div>`
        return
    }

    const resposta = await getTaskApi({ taskId })
    const task = resposta?.tasks ?? resposta

    if (!task?.name) {
        childTaskContainer.innerHTML = `<div class="empty"><p>Não foi possível abrir essa tarefa. Ela pode ter sido excluída.</p></div>`
        return
    }

    document.title = `${task.name} - GUP`

    const childIdOf = (child) => child.child_profile_id ?? child.child_id
    const childrenHtml = (task.children ?? []).map((child) => `
        <li class="assignee">
            ${avatar({ id: childIdOf(child), name: child.name }, { size: 36 })}
            <span class="assignee-name">${escapeHtml(child.name)}</span>
            <span class="tag tag-${STATUS_TAG[child.status] ?? "pending"}">${escapeHtml(statusLabel(child.status))}</span>
            <span class="assignee-actions">
                <button type="button" class="btn btn-sm btn-view-child"
                    data-assignment-id="${escapeHtml(child.assignment_id)}"
                    data-child-id="${escapeHtml(childIdOf(child))}">${child.status === "awaiting_approval" ? "Avaliar" : "Abrir"}</button>
            </span>
        </li>
    `).join("")

    const responsibleHtml = responsible ? `
        <div id="responsible-options">
            <button type="button" class="btn btn-sm" data-action="edit">${pixelIcon("edit", { size: 12 })} Editar</button>
            <button type="button" class="btn btn-sm btn-danger" data-action="delete">${pixelIcon("trash", { size: 12 })} Excluir</button>
        </div>` : ''

    childTaskContainer.innerHTML = `
        <article class="card task-detail">
            <div class="task-detail-head">
                <div>
                    <h1 class="task-detail-title">${escapeHtml(task.name)}</h1>
                    <p class="task-detail-desc ${task.description ? "" : "is-empty"}">${escapeHtml(task.description || "Sem detalhes.")}</p>
                </div>
                ${responsibleHtml}
            </div>
            <dl class="task-facts">
                <div>
                    <dt>Prazo</dt>
                    <dd title="${escapeHtml(formatarDataEHorario(task.deadline))}">${pixelIcon("clock", { size: 14 })} ${escapeHtml(prazoCurto(task.deadline))}</dd>
                </div>
                <div>
                    <dt>Recompensa</dt>
                    <dd>
                        <span class="coin-amount">${pixelIcon("coinColor", { size: 14 })}+${escapeHtml(task.coins_reward)}</span>
                        <span class="xp-amount">${pixelIcon("star", { size: 14 })}+${escapeHtml(task.xp_reward)} XP</span>
                    </dd>
                </div>
                <div>
                    <dt>Foto de comprovação</dt>
                    <dd>${pixelIcon("camera", { size: 14 })} ${task.required_proof ? "Obrigatória" : "Opcional"}</dd>
                </div>
            </dl>
        </article>

        <section class="assignees">
            <div class="section-head"><h2 class="section-title">Quem vai fazer</h2></div>
            <ul id="task-children-list" class="assignee-list">${childrenHtml}</ul>
        </section>
    `

    if (responsible) {
        const actions = {
            edit: () => openEditDialog(task),
            delete: async () => {
                const confirmed = await warning(`Excluir a tarefa "${task.name}"? Ela some para todas as crianças.`, { confirmLabel: "Excluir" })
                if (!confirmed) return

                const deleted = await deleteTaskApi(taskId)
                if (!deleted) return

                location.replace(PAGES.home)
            },
        }
        childTaskContainer.querySelector("#responsible-options").addEventListener("click", (event) => {
            const btn = event.target.closest("[data-action]")
            if (btn) actions[btn.dataset.action]?.()
        })
    }

    childTaskContainer.querySelector("#task-children-list").addEventListener("click", (event) => {
        const btn = event.target.closest(".btn-view-child")
        if (!btn) return

        const query = new URLSearchParams({
            assignment_id: btn.dataset.assignmentId,
            child_id: btn.dataset.childId,
            task_id: taskId,
        })
        window.location.href = `${CHILD_PAGE}?${query}`
    })
}

// a edição abre num <dialog> de verdade (antes o formulário substituía a página)
function openEditDialog(task) {
    const dialog = document.createElement("dialog")
    document.body.append(dialog)
    dialog.addEventListener("close", () => dialog.remove())

    editTask(dialog, task, "responsible", () => dialog.close(), () => showTaskInfo())
    dialog.showModal()
}

showTaskInfo()
