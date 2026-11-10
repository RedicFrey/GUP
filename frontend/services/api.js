// ============================================================
// api.js -> tudo que conversa com o backend passa por aqui
// ============================================================
// As páginas nunca chamam o fetch direto, elas chamam api().
// Assim o tratamento de erro fica escrito uma vez só.

import { API_URL } from "../config/config.js"

// O cookie de login só funciona se o front e a API usarem o MESMO
// endereço (127.0.0.1). Se abriram como "localhost", a gente troca sozinho.
if (location.hostname === "localhost") {
    location.replace(location.href.replace("//localhost", "//127.0.0.1"))
}


// api("/rota", { method, body, mensagem })
// - deu certo: devolve os dados que o backend mandou (ou {} se veio vazio)
// - sessão acabou (401): manda para o login
// - outro erro: escreve no <p> "mensagem" (ou no #mensagem da página) e devolve null
export async function api(caminho, { method = "GET", body, mensagem } = {}) {
    const opcoes = { method, credentials: "include", headers: {} }   // credentials = manda o cookie junto

    // foto (FormData) vai do jeito que está; o resto vira JSON
    if (body instanceof FormData) {
        opcoes.body = body
    } else if (body !== undefined) {
        opcoes.headers["Content-Type"] = "application/json"
        opcoes.body = JSON.stringify(body)
    }

    let resposta
    try {
        resposta = await fetch(API_URL + caminho, opcoes)
    } catch {
        // cai aqui quando o backend está desligado: mostra a faixa vermelha
        document.querySelector("#aviso-offline")?.removeAttribute("hidden")
        return null
    }

    // algumas rotas (tipo excluir) não mandam nada de volta, por isso o catch
    const dados = await resposta.json().catch(() => ({}))

    if (resposta.status === 401) {
        // se o erro fala de "perfil", a conta está logada mas falta escolher o perfil
        location.href = /perfil/i.test(dados.erro) ? "../choose-profile/profiles.html" : "../auth/auth.html"
        return null
    }

    if (!resposta.ok) {
        mostrarMensagem(mensagem ?? document.querySelector("#mensagem"), dados.erro || "Algo deu errado. Tente de novo.")
        return null
    }

    return dados
}


// Escreve um texto num <p class="mensagem">. tipo: "erro" ou "sucesso"
export function mostrarMensagem(elemento, texto, tipo = "erro") {
    if (!elemento) return
    elemento.textContent = texto
    elemento.className = `mensagem ${tipo}`
}


// As imagens da girafa e as fotos das tarefas ficam no backend, em /static
export function imagemDoBackend(caminho) {
    if (!caminho) return ""
    return API_URL + "/" + caminho.replace(/\\/g, "/").replace(/^\/+/, "")
}
