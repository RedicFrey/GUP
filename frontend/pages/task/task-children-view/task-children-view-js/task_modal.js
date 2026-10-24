import { escapeHtml } from '../../../../utils/escape-html.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'

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

export function openPhotoDialog(src, caption = "") {
    const photoDialog = document.createElement("dialog")
    photoDialog.classList.add("photo-dialog")
    photoDialog.innerHTML = `
        <div class="task-dialog-head">
            <h3 class="dialog-title">Foto de comprovação</h3>
            <button type="button" class="btn btn-ghost btn-icon btn-close-photo" aria-label="Fechar">
                ${pixelIcon("close", { size: 16 })}
            </button>
        </div>
        <img src="${escapeHtml(src)}" alt="Foto de comprovação">
    `
    photoDialog.querySelector(".btn-close-photo").addEventListener("click", () => photoDialog.close())
    photoDialog.addEventListener("close", () => photoDialog.remove())   // limpa o DOM ao fechar

    document.body.append(photoDialog)
    photoDialog.showModal()
}