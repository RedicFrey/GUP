import { escapeHtml, isResponsible, proofFileName, proofUrl } from './task_utils.js'
import { paginateRemote } from '../../../generic/pagination.js'
import { showChildrenTask } from '../dialog/selects_task.js'
import { openPhotoDialog } from '../dialog/task_modal.js'

const PROOF_ACCEPT = "image/png,image/jpeg,image/gif,image/webp"

// Status em português. Qualquer valor fora da lista aparece como veio do banco.
const STATUS_LABEL = {
    done: "Concluído",
    awaiting_approval: "Em espera",
    pending: "Pendente",
    not_done: "Atrasada",
}
const statusLabel = (status) => STATUS_LABEL[status] ?? status ?? ''

// Concluído e em espera só mostram o status; qualquer outro status ainda permite enviar
const canSend = (task) => !["awaiting_approval", "done"].includes(task.status)

// Só desenha a lista. O que fazer ao clicar fica nos callbacks (evita import circular com task_actions):
//   onInfoClick(assignment)        -> "Ver Detalhes"
//   onSendProof(assignment, file)  -> "Enviar comprovação" (file = null quando a tarefa não pede foto)
//   onReview(assignment, approve)  -> "Aprovar" (true) / "Recusar" (false)
export function renderDashboardTasks(loadPage, container, profile_type, { onSendProof, onReview, onChanged }) {

    // const tasks = tasksList?.tasks ?? []
    const responsible = isResponsible(profile_type)
    const byAssignment = new Map()

    // Botão de envio: só criança, e só enquanto ainda dá para enviar
    function sendProofHtml(task) {
        if (responsible || !canSend(task)) return ''

        const id = escapeHtml(task.assignment_id)
        if (task.required_proof) {
            return `
            <button type="button" class="btn-send-proof" data-assignment-id="${id}">Enviar comprovação</button>
            <input type="file" class="input-proof" data-assignment-id="${id}" accept="${PROOF_ACCEPT}" hidden>`
        }
        return `
            <button type="button" class="btn-send-proof" data-assignment-id="${id}">Marcar como feita</button>`
    }

    // Aprovar/Recusar: só responsável, e só para tarefa aguardando aprovação
    function reviewButtonsHtml(task) {
        if (!responsible || task.status !== "awaiting_approval") return ''

        const id = escapeHtml(task.assignment_id)
        return `
            <button type="button" class="btn-approve-task" data-assignment-id="${id}">Aprovar</button>
            <button type="button" class="btn-reject-task" data-assignment-id="${id}">Recusar</button>`
    }

    // Foto: com foto, botão para ver; sem foto, avisa
    function proofHtml(task) {
        if (!task.proof_photo) return '<p><strong>Foto:</strong> Não tem foto</p>'

        const id = escapeHtml(task.assignment_id)
        return `<p><strong>Foto:</strong> <button type="button" class="btn-view-proof" data-assignment-id="${id}">Ver foto de comprovação</button></p>`
    }

    const taskSummaryCardHtml = (task) => `
        <div class="task-card">
            <h2>${escapeHtml(task.name)}</h2>
            <p><strong>Prazo:</strong> ${escapeHtml(task.deadline)}</p>
            <p><strong>Moedas:</strong> ${escapeHtml(task.coins_reward)}</p>
            <p><strong>XP:</strong> ${escapeHtml(task.xp_reward)}</p>
            <p><strong>Status:</strong> ${escapeHtml(task.is_late ? "Atrasada" : statusLabel(task.status))}</p>
            ${proofHtml(task)}
            <button class="btn-info" data-assignment-id="${escapeHtml(task.assignment_id)}">Ver Detalhes</button>
            ${sendProofHtml(task)}
            ${reviewButtonsHtml(task)}
        </div>
    `

    // mostra 6 por vez; "Mostrar mais" acrescenta o resto no mesmo container
    paginateRemote({
        loadPage,
        container,
        renderItems: (parte) => {
            parte.forEach(t => byAssignment.set(String(t.assignment_id), t))
            return parte.map(taskSummaryCardHtml).join("")
        },
        pageSize: 6,
        mode: "more",
        empty: "<p>Nenhuma tarefa encontrada.</p>",
    })

    container.onclick = async (event) => {
        const viewProof = event.target.closest('.btn-view-proof')
        if (viewProof) {
            const assignment = byAssignment.get(viewProof.dataset.assignmentId)
            if (assignment?.proof_photo) {
                openPhotoDialog(proofUrl(assignment.proof_photo), proofFileName(assignment.proof_photo))
            }
            return
        }

        const info = event.target.closest('.btn-info')
        if (info) {
            const assignment = byAssignment.get(info.dataset.assignmentId)
            if (!assignment) return

            const dialog = document.createElement("dialog")
            document.body.append(dialog)
            dialog.addEventListener("close", () => dialog.remove())   // limpa o DOM ao fechar

            dialog.showModal()
            showChildrenTask(dialog, {
                assignmentId: assignment.assignment_id,
                childProfileId: assignment.child_profile_id,
                taskId: assignment.task_id,
            }, profile_type, onChanged)
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
        return
    }
        const send = event.target.closest('.btn-send-proof')
        if (!send) return

        const assignment = byAssignment.get(send.dataset.assignmentId)
        if (!assignment) return

        if (assignment.required_proof) {
            // abre o seletor de arquivo; o envio acontece no onchange abaixo
            send.closest('.task-card').querySelector('.input-proof').click()
            return
        }

        send.disabled = true
        await onSendProof(assignment, null)
        send.disabled = false
    }

    // uma foto só: o input não tem "multiple"
    container.onchange = async (event) => {
        const input = event.target.closest('.input-proof')
        if (!input) return

        const assignment = byAssignment.get(input.dataset.assignmentId)
        const file = input.files[0]
        if (!assignment || !file) return

        const btn = input.closest('.task-card').querySelector('.btn-send-proof')
        btn.disabled = true
        await onSendProof(assignment, file)
        btn.disabled = false
        input.value = ''
    }
}

const taskSummaryCardHtml = (task, responsible) => {
    const childrenHtml = responsible ? `
        <div class="task-children">
            ${(task.children ?? []).map((child) => `<span>${escapeHtml(child.name)}</span>`).join("")}
        </div>` : ""

    return `
        <div class="task-card">
            <h2>${escapeHtml(task.name)}</h2>
            <p>${escapeHtml(formatarDataEHorario(task.deadline))}</p>
            ${childrenHtml}
            <button type="button" class="btn-more"
                data-task-id="${escapeHtml(task.task_id)}">Ver mais</button>
        </div>
    `
}

export function renderTasksList(loadPage, container, { onInfoClick, profile_type } = {}) {
    const responsible = isResponsible(profile_type)

    container.onclick = (event) => {
        const btn = event.target.closest(".btn-more")
        if (!btn) return

        onInfoClick?.({ task_id: btn.dataset.taskId })
    }

    return paginateRemote({
        loadPage,
        container,
        renderItems: (parte) => parte.map((task) => taskSummaryCardHtml(task, responsible)).join(""),
        pageSize: 6,
        mode: "more",
        empty: "<p>Nenhuma tarefa encontrada.</p>",
    })
}