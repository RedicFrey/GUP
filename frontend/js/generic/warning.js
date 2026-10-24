import { pixelIcon } from '../../assets/icons/pixel-icons.js'
import { pageUrl } from '../../services/api.js'

// Pergunta de confirmação. Resolve true (confirmou) ou false (cancelou / Esc).
// tone: "danger" (vermelho, para excluir/remover) ou "primary" (amarelo, para ações positivas)
export function warning(message = "Tem certeza?", { confirmLabel = "Confirmar", cancelLabel = "Cancelar", tone = "danger" } = {}) {
    return new Promise(resolve => {
        const warningModal = document.createElement("dialog")
        warningModal.id = 'warning-modal'
        warningModal.dataset.tone = tone
        warningModal.innerHTML = `
            <div><span class="warning-text"></span></div>
            <div>
                <button type="button" id="warning-cancel" class="warning-btn"></button>
                <button type="button" id="warning-confirm" class="warning-btn"></button>
            </div>
        `
        // o texto entra por textContent: nome de tarefa com < > não vira HTML
        warningModal.querySelector(".warning-text").textContent = message
        warningModal.querySelector("#warning-cancel").textContent = cancelLabel
        warningModal.querySelector("#warning-confirm").textContent = confirmLabel
        document.body.append(warningModal)

        let result = false

        warningModal.querySelector("#warning-cancel").addEventListener("click", () => {
            result = false
            warningModal.close()
        })

        warningModal.querySelector("#warning-confirm").addEventListener("click", () => {
            result = true
            warningModal.close()
        })

        warningModal.addEventListener("close", () => {
            warningModal.remove()
            resolve(result)
        })

        warningModal.showModal()
    })
}

export function withoutChildren(section){
    section.innerHTML = `
        <div id="text-about-without-children">
            ${pixelIcon("users", { size: 36 })}
            <p>Ainda não há nenhuma criança na sua conta família.</p>
            <a href="${pageUrl("pages/family-account/family-account.html")}">Adicionar uma criança</a>
        </div>
    `
    section.id = ""
    section.className = "without-children"
}
