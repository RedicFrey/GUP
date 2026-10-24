import { openPhotoDialog } from './task_modal.js'

const ALL_BUTTONS =
    "#btn-send-proof, #btn-mark-done, #btn-preview-proof, #btn-confirm-proof, #btn-change-proof, #btn-remove-proof"

export function setupProofUpload(content, { send, onSent }) {
    const pickBtn = content.querySelector("#btn-send-proof")
    const doneBtn = content.querySelector("#btn-mark-done")
    const fileInput = content.querySelector("#input-proof")
    const selectedArea = content.querySelector("#proof-selected")
    const fileNameEl = content.querySelector("#proof-file-name")
    const previewBtn = content.querySelector("#btn-preview-proof")
    const confirmBtn = content.querySelector("#btn-confirm-proof")
    const changeBtn = content.querySelector("#btn-change-proof")
    const removeBtn = content.querySelector("#btn-remove-proof")
    const thumb = content.querySelector("#proof-thumb")
    const message = document.querySelector("#mensagem")

    // tarefa já enviada / concluída: não tem área de envio
    if (!pickBtn || !fileInput) return

    let selectedFile = null
    let previewUrl = null

    function clearSelection() {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        previewUrl = null
        selectedFile = null
        fileInput.value = ""
        selectedArea.hidden = true
        pickBtn.hidden = false
        if (doneBtn) doneBtn.hidden = false
    }

    function showSelection(file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        selectedFile = file
        previewUrl = URL.createObjectURL(file)
        fileNameEl.textContent = file.name
        if (thumb) thumb.src = previewUrl
        selectedArea.hidden = false
        pickBtn.hidden = true
        if (doneBtn) doneBtn.hidden = true
    }

    async function submit(file) {
        const buttons = content.querySelectorAll(ALL_BUTTONS)
        buttons.forEach(b => b.disabled = true)

        const sent = await send(file)
        if (!sent) {
            buttons.forEach(b => b.disabled = false)
            return
        }

        clearSelection()
        onSent()
    }

    pickBtn.addEventListener("click", () => fileInput.click())
    changeBtn.addEventListener("click", () => fileInput.click())

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            if (message) {
                message.textContent = "Escolha um arquivo de imagem (png, jpg, gif ou webp)."
                message.className = "mensagem erro"
            }
            fileInput.value = ""
            return
        }
        showSelection(file)
    })

    previewBtn.addEventListener("click", () => {
        if (selectedFile) openPhotoDialog(previewUrl, selectedFile.name)
    })

    removeBtn.addEventListener("click", clearSelection)
    confirmBtn.addEventListener("click", () => { if (selectedFile) submit(selectedFile) })
    doneBtn?.addEventListener("click", () => submit(null))
}