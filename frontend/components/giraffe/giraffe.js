// ============================================================
// giraffe.js -> desenha a girafa da criança
// ============================================================
// A girafa é feita de imagens empilhadas (camadas), como no Photoshop:
//   1. background -> o cenário (fica atrás)
//   2. color      -> o corpo da girafa
//   3. accessory  -> chapéu, óculos... (fica na frente, e pode não ter)
// Os dados vêm de GET /girafas/me -> { color, background, accessory }

import { imagemDoBackend } from "../../services/api.js"

// Só o corpo + acessório (sem cenário). Usado na capa do perfil.
export function girafaHtml(girafa, classe = "") {
    const acessorio = girafa.accessory
        ? `<img class="giraffe-layer" src="${imagemDoBackend(girafa.accessory.image_url)}" alt="">`
        : ""
    return `
        <span class="giraffe-sprite ${classe}">
            <img class="giraffe-layer" src="${imagemDoBackend(girafa.color.image_url)}" alt="Girafa">
            ${acessorio}
        </span>`
}

// Cenário + girafa. O elemento que recebe precisa ter a classe "giraffe-scene".
export function cenaHtml(girafa) {
    return `
        <img class="giraffe-scene-bg" src="${imagemDoBackend(girafa.background.image_url)}" alt="">
        ${girafaHtml(girafa, "giraffe-scene-sprite")}`
}
