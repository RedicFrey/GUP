import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'

// Esqueleto dos diálogos de tarefa: título + botão fechar, e a área de conteúdo
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
