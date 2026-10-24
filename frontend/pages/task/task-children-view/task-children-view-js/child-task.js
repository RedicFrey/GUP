import { loadFamilyContext } from '../../../../utils/family-context.js'
import { sideBar } from '../../../../components/sidebar/sidebar.js'

import { selectTasksByChildApi, submitTaskProofApi, reviewTaskApi } from './task_api.js'
import { openPhotoDialog } from './task_modal.js'

import { proofUrl, proofFileName } from './task_utils.js'
import { childTaskHtml } from './child_task_view.js'
import { setupProofUpload } from './proof_upload.js'
import { pageUrl } from '../../../../services/api.js'

const DASHBOARD_PAGE = pageUrl("pages/home/dashboard.html")
const RESPONSIBLE_PAGE = pageUrl("pages/task/task-responsible-view/task-responsible-view.html")

const params = new URLSearchParams(window.location.search)
const taskId = params.get("task_id")
const assignmentId = params.get("assignment_id")
const childProfileId = params.get("child_id")

const content = document.querySelector(".children-task-content")
const backLink = document.querySelector(".btn-back-task")

let responsible = false

sideBar()

async function init() {
    if (!assignmentId || !childProfileId) {
        content.innerHTML = `<div class="empty"><p>Nenhuma tarefa foi escolhida.</p></div>`
        return
    }

    const ctx = await loadFamilyContext()
    responsible = ctx.isResponsible

    if (responsible && taskId) {
        backLink.href = `${RESPONSIBLE_PAGE}?task_id=${encodeURIComponent(taskId)}`
        backLink.textContent = "‹ Voltar para a tarefa"
    } else {
        backLink.href = DASHBOARD_PAGE
    }

    await loadChildTask()
}

async function loadChildTask() {
    const resposta = await selectTasksByChildApi({
        childProfileId,
        taskAssignmentId: assignmentId,
    })

    let item = resposta?.tasks ?? resposta
    if (Array.isArray(item)) item = item[0]

    if (!item || !item.name) {
        content.innerHTML = `<div class="empty"><p>Não foi possível abrir essa tarefa.</p></div>`
        return
    }

    document.title = `${item.name} - GUP`
    content.innerHTML = childTaskHtml(item, responsible)

    const photo = content.querySelector("#btn-view-proof")
    const openPhoto = () => openPhotoDialog(proofUrl(item.proof_photo), proofFileName(item.proof_photo))
    photo?.addEventListener("click", openPhoto)
    photo?.addEventListener("keydown", (e) => { if (e.key === "Enter") openPhoto() })

    const assignment = item.assignment_id ?? assignmentId

    if (responsible) {
        setupReview(assignment)
    } else {
        setupProofUpload(content, {
            send: (file) => sendProof(assignment, file),
            onSent: loadChildTask,
        })
    }
}

async function sendProof(assignment, file) {
    const formData = new FormData()
    if (file) formData.append("foto_comprovacao", file)
    return submitTaskProofApi(assignment, formData)
}

function setupReview(assignment) {
    async function review(approve) {
        const buttons = content.querySelectorAll("#btn-approve-task, #btn-reject-task")
        buttons.forEach(b => b.disabled = true)

        const reviewed = await reviewTaskApi(assignment, approve)
        if (!reviewed) {
            buttons.forEach(b => b.disabled = false)
            return
        }

        loadChildTask()
    }

    content.querySelector("#btn-approve-task")?.addEventListener("click", () => review(true))
    content.querySelector("#btn-reject-task")?.addEventListener("click", () => review(false))
}

init()
