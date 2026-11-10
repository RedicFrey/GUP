// ============================================================
// formatar.js -> deixar textos e datas prontos para a tela
// ============================================================

// Deixa um texto seguro para colocar no innerHTML.
// Se alguém criar uma tarefa chamada "<b>oi</b>", sem isso o navegador
// ia entender como HTML de verdade. Trocando < > & " por códigos,
// o texto aparece igualzinho foi digitado.
export function escapeHtml(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
}

// O backend manda as datas assim: "2026-10-23T18:00:00" ou só "2026-10-23".
// Data sem hora o JS lê como meia-noite em Londres (e aqui vira o dia anterior),
// por isso a gente coloca "T00:00" no fim para ler no horário daqui.
function lerData(texto) {
    return new Date(texto.length === 10 ? texto + "T00:00" : texto)
}

// "2026-10-23T18:00:00" -> "23/10, 18:00"
export function dataHora(texto) {
    if (!texto) return ""
    return lerData(texto).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

// "2026-10-23" -> "23/10/2026"
export function data(texto) {
    if (!texto) return ""
    return lerData(texto).toLocaleDateString("pt-BR")
}

// Já passou dessa data/hora?
export function passou(texto) {
    return texto ? lerData(texto) < new Date() : false
}
