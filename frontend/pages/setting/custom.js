// ============================================================
// custom.js -> página "Sua girafa" (personalizar)
// ============================================================
// Esquerda: a girafa como está agora.
// Direita: abas (Acessório / Cor / Cenário) com os itens.
// Item com nível maior que o da criança fica trancado com um cadeado.

import { api, imagemDoBackend } from "../../services/api.js"
import { meuPerfil } from "../../services/perfil.js"
import { cenaHtml } from "../../components/giraffe/giraffe.js"

const catalogo = document.querySelector("#catalogo")
const perfil = await meuPerfil()

let aba = document.querySelector("#abas .active")   // o botão da aba escolhida
let girafa = null


// GET /girafas/me -> redesenha a cena da esquerda
async function carregarGirafa() {
    girafa = await api("/girafas/me")
    if (!girafa) return
    document.querySelector("#cena").innerHTML = cenaHtml(girafa)
}

// GET /girafas/itens/<tipo> -> [{ id, name, image_url, required_level }]
async function carregarCatalogo() {
    const tipo = aba.dataset.tipo
    const itens = await api(`/girafas/itens/${tipo}`)
    if (!itens) return

    // "Tirar acessório" só aparece na aba de acessório e se tiver um
    document.querySelector("#tirar-acessorio").hidden = tipo !== "accessory" || !girafa.accessory

    const equipado = girafa[tipo]?.id
    catalogo.className = `giraffe-catalog giraffe-catalog--${tipo}`
    catalogo.innerHTML = itens.map((item) => {
        const trancado = perfil.level_id < item.required_level
        // acessório tem uma miniatura centralizada na pasta "thumbs"
        const imagem = tipo === "accessory" ? item.image_url.replace("/accessories/", "/thumbs/accessories/") : item.image_url

        return `
            <button type="button" title="${item.name}" data-id="${item.id}" ${trancado ? "disabled" : ""}
                class="giraffe-item giraffe-item--${tipo} ${trancado ? "giraffe-item--locked" : ""} ${item.id === equipado ? "giraffe-item--equipped" : ""}">
                <img class="giraffe-item__image" src="${imagemDoBackend(imagem)}" alt="">
                ${trancado
                    ? `<span class="giraffe-item__lock"><i class="icone i-lock"></i><small>Nível ${item.required_level}</small></span>`
                    : `<span class="giraffe-item__check"><i class="icone i-check"></i></span>`}
            </button>`
    }).join("")
}

// PATCH /girafas/me com o campo que mudou (ex: { color_id: 2 })
async function equipar(mudanca) {
    if (!(await api("/girafas/me", { method: "PATCH", body: mudanca }))) return
    await carregarGirafa()
    carregarCatalogo()
}


// Trocar de aba
document.querySelector("#abas").addEventListener("click", (evento) => {
    if (evento.target.tagName !== "BUTTON") return
    aba.classList.remove("active")
    aba = evento.target
    aba.classList.add("active")
    carregarCatalogo()
})

// Clicou num item: equipa ele
catalogo.addEventListener("click", (evento) => {
    const item = evento.target.closest(".giraffe-item")
    if (item) equipar({ [aba.dataset.campo]: Number(item.dataset.id) })
})

// tirar acessório = mandar accessory_id: null
document.querySelector("#tirar-acessorio").addEventListener("click", () => equipar({ accessory_id: null }))


// só criança tem girafa
if (perfil?.profile_type === "child") {
    document.querySelector("#nivel").textContent = `Nível ${perfil.level_id}`
    await carregarGirafa()
    carregarCatalogo()
}
