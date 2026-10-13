
export function warning(message = "Tem certeza?") {
    return new Promise(resolve => {
        const warningModal = document.createElement("dialog")
        warningModal.innerHTML = `
            <div><span>${message}<span></div>
            <div>
                <button type="button" id="warning-cancel" class="warning-btn">Cancelar</button>
                <button type="button" id="warning-confirm" class="warning-btn">Confirmar</button>
            </div>
        `
        warningModal.id = 'warning-modal'
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
        <div></div>
        <div id="text-about-without-children">
            <p>Sua conta família não possui nenhuma criança</p>
            <a href="family_account.html">Cadastre um perfil para seu filho!</a>
        </div>
        
    `
    section.id = ""
    section.className = ""

    section.className = "without-children"
}
