
import { escapeHtml } from '../../../../utils/escape-html.js'
import { parseApiDate } from '../../../../utils/formatar.js'
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
    { id: 1, coins: 10, xp: 15, nivel: "easy", label: "Fácil" },
    { id: 2, coins: 15, xp: 15, nivel: "normal", label: "Normal" },
    { id: 3, coins: 20, xp: 15, nivel: "hard", label: "Difícil" },
]

// valor para <input type="datetime-local"> no horário "de parede" (sem converter fuso)
export function toInputDate(value) {
    const date = parseApiDate(value)
    if (!date) return ''
    const pad = (n) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Monta o esqueleto do modal (botão Voltar + área de conteúdo) e devolve a área de conteúdo
export function prepararModal(dialog, onBack = () => dialog.close(), title = "") {
    dialog.classList.add("task-dialog")
    dialog.innerHTML = `
        <div class="task-dialog-head">
            <h3 class="dialog-title"></h3>
            <button type="button" id="btn-back" class="btn btn-ghost btn-icon" aria-label="Fechar">
                ${pixelIcon("close", { size: 16 })}
            </button>
        </div>
        <div id="container-modal"></div>
    `
    dialog.querySelector(".dialog-title").textContent = title
    dialog.querySelector("#btn-back").addEventListener("click", onBack)
    return dialog.querySelector("#container-modal")
}


// ---------- Foto de comprovação (modal da foto) ----------

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