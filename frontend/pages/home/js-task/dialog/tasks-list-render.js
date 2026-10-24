import { escapeHtml } from '../../../../utils/escape-html.js'
import { prazoCurto } from '../../../../utils/formatar.js'
import { paginateRemote } from '../../../../utils/pagination.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../../components/avatar/avatar.js'
import { isResponsible } from '../shared/task-utils.js'
import { CHILD_PAGE, RESPONSIBLE_PAGE, PAGE_SIZE } from '../shared/task-constants.js'

const cardHtml = (task, responsible, childId) => {
    const kids = task.children ?? []
    // a criança abre a atribuição dela, não a de um irmão
    const own = kids.find((k) => String(k.child_profile_id) === String(childId))
    const childrenHtml = responsible && kids.length ? `
        <span class="task-who-group">
            ${kids.map((child) => `<span class="task-who" title="${escapeHtml(child.name)}">${avatar({ id: child.child_profile_id, name: child.name }, { size: 20 })}${escapeHtml(child.name)}</span>`).join("")}
        </span>` : ""

    return `
        <article class="task-card task-compact">
            <div class="task-card-main">
                <h3 class="task-title">${escapeHtml(task.name)}</h3>
                <p class="task-meta">
                    <span class="task-meta-item">${pixelIcon("clock", { size: 14 })} ${escapeHtml(prazoCurto(task.deadline))}</span>
                    ${childrenHtml}
                </p>
            </div>
            <div class="task-card-actions">
                <button type="button" class="btn btn-sm btn-more"
                    data-task-id="${escapeHtml(task.task_id ?? task.id)}"
                    data-assignment-id="${escapeHtml(task.assignment_id ?? own?.assignment_id ?? kids[0]?.assignment_id ?? '')}">Abrir</button>
            </div>
        </article>
    `
}

export function renderTasksList(loadPage, container, { profile_type, childId } = {}) {
    const responsible = isResponsible(profile_type)

    container.onclick = (event) => {
        const btn = event.target.closest(".btn-more")
        if (!btn) return

        const { taskId, assignmentId } = btn.dataset

        if (responsible) {
            window.location.href = `${RESPONSIBLE_PAGE}?${new URLSearchParams({ task_id: taskId })}`
            return
        }

        if (!assignmentId || !childId) {
            console.error("Faltam dados para abrir a tarefa:", { assignmentId, childId })
            return
        }

        window.location.href = `${CHILD_PAGE}?${new URLSearchParams({
            assignment_id: assignmentId,
            child_id: childId,
            task_id: taskId,
        })}`
    }

    return paginateRemote({
        loadPage,
        container,
        renderItems: (items) => items
            // a lista vem da família toda: a criança só vê as tarefas dela
            .filter((task) => responsible || !task.children || task.children.some((k) => String(k.child_profile_id) === String(childId)))
            .map((task) => cardHtml(task, responsible, childId)).join(""),
        pageSize: PAGE_SIZE,
        mode: "more",
        empty: `<div class="empty">${pixelIcon("calendar", { size: 28 })}<p>Nenhuma tarefa nesse período.</p></div>`,
    })
}
