import { warning } from '../../../generic/warning.js'
import { editTask } from './update.js'
import { getTaskApi, selectTasksByChildApi, deleteTaskApi, submitTaskProofApi, reviewTaskApi } from '../core/task_api.js'
import { escapeHtml, isResponsible, proofFileName, proofUrl } from '../core/task_utils.js'
import { openPhotoDialog, viewProofPhoto } from './task_modal.js'

// Tarefa de uma criança. "Voltar" (para os detalhes da tarefa) só existe para o responsável.
const PROOF_ACCEPT = "image/png,image/jpeg,image/gif,image/webp"

const STATUS_LABEL = {
    done: "Concluído",
    awaiting_approval: "Em espera",
    pending: "Pendente",
    not_done: "Atrasada",
}

// Em espera e concluído só mostram o status; qualquer outro ainda permite enviar
const canSend = (status) => !["awaiting_approval", "done"].includes(status)

export async function showChildrenTask(dialog, { assignmentId, childProfileId, taskId }, profile_type, onChanged) {
    const responsible = isResponsible(profile_type)
    const refresh = () => showChildrenTask(dialog, { assignmentId, childProfileId, taskId }, profile_type, onChanged)

    dialog.innerHTML = `
        <div>
            ${responsible ? '<button type="button" id="btn-back-task">Voltar</button>' : ''}
            <button type="button" id="close-dialog-children-task">X</button>
        </div>
        <div id="children-task-content">Carregando...</div>
    `
    dialog.querySelector("#btn-back-task")
        ?.addEventListener("click", () => showTaskInfo(dialog, taskId, profile_type, onChanged))
    dialog.querySelector("#close-dialog-children-task")
        .addEventListener("click", () => dialog.close())

    if (!dialog.open) dialog.showModal()

    const content = dialog.querySelector("#children-task-content")

    const resposta = await selectTasksByChildApi({
        childProfileId,
        taskAssignmentId: assignmentId,
    })

    let item = resposta?.tasks ?? resposta
    if (Array.isArray(item)) item = item[0]

    if (!item) {
        content.textContent = "Não foi possível pegar a tarefa dessa criança."
        return
    }

    const status = item.status
    const requiredProof = Boolean(item.required_proof)
    const hasPhoto = Boolean(item.proof_photo)
    const assignment = item.assignment_id ?? assignmentId

    // Criança: enviar comprovação (se exige foto) ou marcar como feita (se não exige)
    const canAct = !responsible && canSend(status)

    const disabledAttr = canAct ? "" : "disabled"

    const disabledReason =
        status === "done" ? "Tarefa já concluída"
        : status === "awaiting_approval" ? "Já enviada, aguardando aprovação"
        : ""
    const titleAttr = !canAct && disabledReason ? `title="${disabledReason}"` : ""

    const sendHtml = !responsible ? `
        <div id="proof-area">
            <button type="button" id="btn-send-proof" ${disabledAttr} ${titleAttr}>
                ${requiredProof ? "Escolher comprovação" : "Escolher foto (opcional)"}
            </button>
            <input type="file" id="input-proof" accept="${PROOF_ACCEPT}" hidden>

            <div id="proof-selected" hidden>
                <span id="proof-file-name"></span>
                <button type="button" id="btn-preview-proof">Ver foto</button>
                <button type="button" id="btn-confirm-proof">Enviar</button>
                <button type="button" id="btn-change-proof">Trocar foto</button>
                <button type="button" id="btn-remove-proof">Remover</button>
            </div>
        </div>
        ${requiredProof ? "" : `<button type="button" id="btn-mark-done" ${disabledAttr} ${titleAttr}>Marcar como feita (sem foto)</button>`}
    ` : ""

    const canReview = responsible && status === "awaiting_approval"
    const reviewDisabledAttr = canReview ? "" : "disabled"

    const reviewReason =
        status === "done" ? "Tarefa já concluída"
        : "A criança ainda não enviou a tarefa"
    const reviewTitleAttr = !canReview ? `title="${reviewReason}"` : ""

    const reviewHtml = responsible ? `
        <button type="button" id="btn-approve-task" ${reviewDisabledAttr} ${reviewTitleAttr}>Aprovar</button>
        <button type="button" id="btn-reject-task" ${reviewDisabledAttr} ${reviewTitleAttr}>Recusar</button>` : ''

    // Foto: com foto, botão para ver; sem foto, avisa
    const proofHtml = hasPhoto
        ? `<button type="button" id="btn-view-proof">Ver foto de comprovação</button>`
        : "Não tem foto"

    content.innerHTML = `
        <h2>${escapeHtml(item.child_name)}</h2>
        <p><strong>Tarefa:</strong> ${escapeHtml(item.name)}</p>
        <p><strong>Status:</strong> ${escapeHtml(STATUS_LABEL[status] ?? status)}</p>
        <p><strong>Prazo:</strong> ${escapeHtml(formatarDataEHorario(item.deadline))}</p>
        <p><strong>Foto:</strong> ${proofHtml}</p>
        <div id="children-task-actions">
            ${sendHtml}
            ${reviewHtml}
        </div>
    `

    // Ver foto já enviada
    content.querySelector("#btn-view-proof")?.addEventListener("click", () => {
        openPhotoDialog(proofUrl(item.proof_photo), proofFileName(item.proof_photo))
    })

    // Enviar comprovação / marcar como feita
    const pickBtn = content.querySelector("#btn-send-proof")
    const doneBtn = content.querySelector("#btn-mark-done")
    const fileInput = content.querySelector("#input-proof")
    const selectedArea = content.querySelector("#proof-selected")
    const fileNameEl = content.querySelector("#proof-file-name")
    const previewBtn = content.querySelector("#btn-preview-proof")
    const confirmBtn = content.querySelector("#btn-confirm-proof")
    const changeBtn = content.querySelector("#btn-change-proof")
    const removeBtn = content.querySelector("#btn-remove-proof")

    let selectedFile = null
    let previewUrl = null

    function clearSelection() {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        previewUrl = null
        selectedFile = null
        if (fileInput) fileInput.value = ""
        if (selectedArea) selectedArea.hidden = true
        if (pickBtn) pickBtn.hidden = false
        if (doneBtn) doneBtn.hidden = false
    }

    function showSelection(file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        selectedFile = file
        previewUrl = URL.createObjectURL(file)
        fileNameEl.textContent = file.name
        selectedArea.hidden = false
        pickBtn.hidden = true
        if (doneBtn) doneBtn.hidden = true
    }

    async function send(file) {
        const buttons = content.querySelectorAll(
            "#btn-send-proof, #btn-mark-done, #btn-preview-proof, #btn-confirm-proof, #btn-change-proof, #btn-remove-proof"
        )
        buttons.forEach(b => b.disabled = true)

        const formData = new FormData()
        if (file) formData.append("foto_comprovacao", file)

        const sent = await submitTaskProofApi(assignment, formData)
        if (!sent) {
            buttons.forEach(b => b.disabled = false)
            return
        }

        clearSelection()
        onChanged?.()
        refresh()
    }

    pickBtn?.addEventListener("click", () => fileInput.click())
    changeBtn?.addEventListener("click", () => fileInput.click())

    fileInput?.addEventListener("change", () => {
        const file = fileInput.files[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            alert("Escolha um arquivo de imagem.")
            fileInput.value = ""
            return
        }
        showSelection(file)
    })

    // visualização da foto ainda não enviada
    previewBtn?.addEventListener("click", () => {
        if (selectedFile) openPhotoDialog(previewUrl, selectedFile.name)
    })

    removeBtn?.addEventListener("click", clearSelection)
    confirmBtn?.addEventListener("click", () => { if (selectedFile) send(selectedFile) })
    doneBtn?.addEventListener("click", () => send(null))

    // Aprovar / recusar
    async function review(approve) {
        const buttons = content.querySelectorAll("#btn-approve-task, #btn-reject-task")
        buttons.forEach(b => b.disabled = true)

        const reviewed = await reviewTaskApi(assignment, approve)
        if (!reviewed) {
            buttons.forEach(b => b.disabled = false)
            return
        }

        onChanged?.()
        refresh()
    }

    content.querySelector("#btn-approve-task")?.addEventListener("click", () => review(true))
    content.querySelector("#btn-reject-task")?.addEventListener("click", () => review(false))
}

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