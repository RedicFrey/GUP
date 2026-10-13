
import { escapeHtml, proofFileName, proofUrl } from '../core/task_utils.js'


// ---------- Crianças da família (definidas uma vez pelo dashboard) ----------

let familyChildrenList = []

export function setFamilyChildren(list) {
    familyChildrenList = list
}

export function getFamilyChildren() {
    return familyChildrenList
}


// ---------- Constantes e helpers compartilhados ----------

export const REWARDS = [
    { id: 1, coins: 10, xp: 15, nivel: "easy" },
    { id: 2, coins: 15, xp: 15, nivel: "normal" },
    { id: 3, coins: 20, xp: 15, nivel: "hard" },
]

export function toInputDate(value) {
    const date = new Date(value)
    return !value || isNaN(date) ? '' : date.toISOString().slice(0, 16)
}

// Monta o esqueleto do modal (botão Voltar + área de conteúdo) e devolve a área de conteúdo
export function prepararModal(dialog, onBack = () => dialog.close()) {
    dialog.innerHTML = `
        <div id="back-dashboard">
            <button type="button" id="btn-back">Voltar</button>
        </div>
        <div id="container-modal"></div>
    `
    dialog.querySelector("#btn-back").addEventListener("click", onBack)
    return dialog.querySelector("#container-modal")
}


// ---------- Foto de comprovação (modal da foto) ----------

export function viewProofPhoto(dialog, assignment, onBack) {
    const main = prepararModal(dialog, onBack)

    main.innerHTML = `
        <section id="task-proof">
            <p>${escapeHtml(proofFileName(assignment.proof_photo))}</p>
            <img src="${escapeHtml(proofUrl(assignment.proof_photo))}" alt="Foto de comprovação">
        </section>
    `
}

export function openPhotoDialog(src, caption = "") {
    const photoDialog = document.createElement("dialog")
    photoDialog.classList.add("photo-dialog")
    photoDialog.innerHTML = `
        <div>
            <button type="button" class="btn-close-photo">Fechar</button>
        </div>
        <img src="${escapeHtml(src)}" alt="Foto de comprovação" style="max-width:100%; max-height:70vh">
    `
    photoDialog.querySelector(".btn-close-photo").addEventListener("click", () => photoDialog.close())
    photoDialog.addEventListener("close", () => photoDialog.remove())   // limpa o DOM ao fechar

    document.body.append(photoDialog)
    photoDialog.showModal()
}