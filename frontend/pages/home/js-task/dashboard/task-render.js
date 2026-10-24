import { escapeHtml } from '../../../../utils/escape-html.js'
import { prazoCurto } from '../../../../utils/formatar.js'
import { paginateRemote } from '../../../../utils/pagination.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'
import { avatar } from '../../../../components/avatar/avatar.js'
import { isResponsible } from '../shared/task-utils.js'
import { proofUrl, openPhotoDialog } from '../shared/task-proof.js'
import { CHILD_PAGE, PAGE_SIZE, taskState } from '../shared/task-constants.js'

const EMPTY = {
    child: `<div class="empty">${pixelIcon("check", { size: 28 })}<p>Nada para hoje por aqui. Aproveite o descanso!</p></div>`,
    responsible: `<div class="empty">${pixelIcon("list", { size: 28 })}<p>Nenhuma tarefa com esse filtro hoje.</p></div>`,
}

function childPageUrl(task) {
    return `${CHILD_PAGE}?${new URLSearchParams({
        assignment_id: task.assignment_id,
        child_id: task.child_profile_id,
        task_id: task.task_id,
    })}`
}

function actionsHtml(task, responsible, state) {
    const id = escapeHtml(task.assignment_id)
    const proof = task.proof_photo
        ? `<button type="button" class="btn btn-sm btn-ghost btn-view-proof" data-assignment-id="${id}">
               ${pixelIcon("camera", { size: 14 })} Ver foto
           </button>`
        : ""

    if (responsible && task.status === "awaiting_approval") {
        return `
            ${proof}
            <button type="button" class="btn btn-sm btn-danger btn-reject-task" data-assignment-id="${id}">Recusar</button>
            <button type="button" class="btn btn-sm btn-success btn-approve-task" data-assignment-id="${id}">Aprovar</button>`
    }

    // criança com tarefa ainda para fazer: o botão principal leva para enviar
    if (!responsible && (state.key === "pending" || state.key === "late")) {
        return `<a class="btn btn-sm btn-primary task-go" href="${escapeHtml(childPageUrl(task))}">Fazer tarefa</a>`
    }

    return `${proof}<a class="btn btn-sm task-go" href="${escapeHtml(childPageUrl(task))}">Abrir</a>`
}

const cardHtml = (task, responsible, childrenById) => {
    const state = taskState(task)
    const child = childrenById?.get(String(task.child_profile_id))
    const whoHtml = responsible && child
        ? `<span class="task-who">${avatar(child, { size: 20 })}${escapeHtml(child.name)}</span>`
        : ""
    const photoNeeded = Number(task.required_proof)
        ? `<span class="task-meta-item">${pixelIcon("camera", { size: 14 })} Precisa de foto</span>`
        : ""

    return `
    <article class="task-card task-${state.key}">
        <div class="task-card-main">
            <h3 class="task-title">
                <a href="${escapeHtml(childPageUrl(task))}">${escapeHtml(task.name)}</a>
            </h3>
            <p class="task-meta">
                ${whoHtml}
                <span class="task-meta-item">${pixelIcon("clock", { size: 14 })} ${escapeHtml(prazoCurto(task.deadline))}</span>
                ${photoNeeded}
            </p>
        </div>
        <span class="tag tag-${state.key} task-card-tag">${escapeHtml(state.label)}</span>
        <div class="task-card-foot">
            <span class="task-rewards" aria-label="Recompensa">
                <span class="coin-amount">${pixelIcon("coinColor", { size: 14 })}+${escapeHtml(task.coins_reward)}</span>
                <span class="xp-amount">${pixelIcon("star", { size: 14 })}+${escapeHtml(task.xp_reward)} XP</span>
            </span>
            <div class="task-card-actions">${actionsHtml(task, responsible, state)}</div>
        </div>
    </article>
    `
}

export function renderDashboardTasks(loadPage, container, profile_type, onReview, { childrenById } = {}) {
    const responsible = isResponsible(profile_type)
    const byAssignment = new Map()

    container.onclick = async (event) => {
        const viewProof = event.target.closest('.btn-view-proof')
        if (viewProof) {
            const assignment = byAssignment.get(viewProof.dataset.assignmentId)
            if (assignment?.proof_photo) openPhotoDialog(proofUrl(assignment.proof_photo), assignment.name)
            return
        }

        const review = event.target.closest('.btn-approve-task, .btn-reject-task')
        if (review) {
            const assignment = byAssignment.get(review.dataset.assignmentId)
            if (!assignment) return

            const buttons = review.closest('.task-card').querySelectorAll('.btn-approve-task, .btn-reject-task')
            buttons.forEach(b => b.disabled = true)
            await onReview(assignment, review.classList.contains('btn-approve-task'))
            buttons.forEach(b => b.disabled = false)
        }
    }

    return paginateRemote({
        loadPage,
        container,
        renderItems: (items) => {
            items.forEach(t => byAssignment.set(String(t.assignment_id), t))
            return items.map(t => cardHtml(t, responsible, childrenById)).join("")
        },
        pageSize: PAGE_SIZE,
        mode: "more",
        empty: responsible ? EMPTY.responsible : EMPTY.child,
    })
}
