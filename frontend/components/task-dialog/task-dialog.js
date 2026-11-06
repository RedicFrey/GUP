import { escapeHtml } from '../../utils/escape-html.js'
import { pixelIcon } from '../../assets/icons/pixel-icons.js'

// Esqueleto dos diálogos de tarefa: título + botão fechar. Devolve a área de conteúdo.
export function prepareModal(dialog, onBack = () => dialog.close(), title = "") {
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

// Foto de comprovação 
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
        <img src="${escapeHtml(src)}" alt="Foto de comprovação${caption ? `: ${escapeHtml(caption)}` : ""}">
    `
    photoDialog.querySelector(".btn-close-photo").addEventListener("click", () => photoDialog.close())
    photoDialog.addEventListener("close", () => photoDialog.remove())   

    document.body.append(photoDialog)
    photoDialog.showModal()
}
