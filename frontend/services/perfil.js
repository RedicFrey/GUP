// ============================================================
// perfil.js -> quem está logado e quais crianças tem na família
// ============================================================
// O menu e a página precisam das mesmas informações. Para não pedir
// duas vezes a mesma coisa para a API, a gente guarda a primeira
// resposta (a "promessa") e reaproveita.

import { api } from "./api.js"
import { escapeHtml } from "../utils/formatar.js"

let perfilGuardado = null
let criancasGuardadas = null

// GET /perfis-conta-familia/me -> o perfil logado (criança vem com moedas, xp, nível...)
export function meuPerfil() {
    if (!perfilGuardado) perfilGuardado = api("/perfis-conta-familia/me")
    return perfilGuardado
}

// GET /perfis-conta-familia/criancas -> lista das crianças da família
export async function criancasDaFamilia() {
    if (!criancasGuardadas) criancasGuardadas = api("/perfis-conta-familia/criancas")
    return (await criancasGuardadas) ?? []
}

// Texto que aparece embaixo do nome
export function nomeDoPapel(perfil) {
    if (perfil.profile_type === "child") return "Criança"
    if (perfil.role === "admin") return "Administrador"
    return "Responsável"
}

// Cada perfil ganha um dos 6 desenhos da pasta assets/avatars.
// O resto da divisão do id por 6 dá sempre um número de 0 a 5.
export function avatar(perfil, classe = "") {
    return `<img class="avatar ${classe}" src="../../assets/avatars/avatar-${perfil.id % 6}.svg" alt="">`
}

// Botões com as crianças, para o responsável escolher qual ver.
// Moedas, Resgates e Relatório usam. Quando clica, chama aoEscolher(id).
export async function botoesDasCriancas(aoEscolher) {
    const caixa = document.querySelector("#escolher-crianca")
    const criancas = await criancasDaFamilia()

    if (criancas.length === 0) {
        document.querySelector("#sem-criancas").hidden = false
        return
    }

    caixa.innerHTML = criancas.map((c) => `
        <button type="button" class="chip" data-id="${c.id}">${avatar(c, "avatar-p")} ${escapeHtml(c.name)}</button>
    `).join("")

    caixa.addEventListener("click", (evento) => {
        const chip = evento.target.closest(".chip")
        if (!chip) return
        caixa.querySelectorAll(".chip").forEach((c) => c.classList.remove("ativo"))
        chip.classList.add("ativo")
        aoEscolher(Number(chip.dataset.id))
    })

    caixa.querySelector(".chip").click()   // começa mostrando a primeira criança
}
