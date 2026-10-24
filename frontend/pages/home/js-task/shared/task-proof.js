import { escapeHtml } from '../../../../utils/escape-html.js'
import { API_URL } from '../../../../services/api.js'
import { pixelIcon } from '../../../../assets/icons/pixel-icons.js'

export const proofFileName = (path = '') => String(path).split(/[\\/]/).pop()

export const proofUrl = (path = '') => {
    const clean = String(path).replace(/\\/g, '/').replace(/^\/+/, '')
    if (!clean) return ''

    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('blob:')) return clean
    if (clean.startsWith('static/')) return `${API_URL}/${clean}`
    if (clean.startsWith('uploads/')) return `${API_URL}/static/${clean}`

    return `${API_URL}/static/uploads/proofs/${clean}`
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
        <img src="${escapeHtml(src)}" alt="Foto de comprovação${caption ? `: ${escapeHtml(caption)}` : ""}">
    `
    photoDialog.querySelector(".btn-close-photo").addEventListener("click", () => photoDialog.close())
    photoDialog.addEventListener("close", () => photoDialog.remove())

    document.body.append(photoDialog)
    photoDialog.showModal()
}
