const API_URL = "http://127.0.0.1:5000";

// =======================================================
// Uma função que recebe os parâmetros e faz o fetch e devolve
// =======================================================
async function apiFetch(caminho, opcoes = {}) {
  const configuracao = {
    method: opcoes.method || "GET",
    credentials: "include",
    headers: {},
  };

  if (opcoes.body instanceof FormData) {
    configuracao.body = opcoes.body;

  } else if (opcoes.body !== undefined) {
    configuracao.headers["Content-Type"] = "application/json";
    configuracao.body = JSON.stringify(opcoes.body);
  }

  const resposta = await fetch(`${API_URL}${caminho}`, configuracao);
  const dados = await resposta.json().catch(() => null);
  return { ok: resposta.ok, status: resposta.status, dados };
}

// =======================================================
// Mensaegem de erro
// =======================================================
function mostrarMensagem(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `mensagem ${tipo}`;
}

// ===============================================================
// fazer também o exigir perfil
// ===============================================================
async function exigirLogin() {
  const { dados } = await apiFetch("/auth-usuarios/me");
  if (!dados || !dados.logado) {
    window.location.href = "auth.html";
    return null;
  }
  return dados;
}

// =======================================================
// Transforma num objeto data do js e no padrão brasileiro
// =======================================================
function formatarDataEHorario(isoString) {
  if (!isoString) return "—";
  const data = new Date(isoString);
  // transforma na data padrão do Brasil
  return data.toLocaleString("pt-BR");
}

function formatarData(dataString) {
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
}

// =======================================================
// Centralizando lógica da mensagem de erro
// =======================================================
function erroMensagem(resposta, elementoMensagem, msgPadrao) {
  if (!resposta.ok) {
    mostrarMensagem(elementoMensagem, resposta.dados?.erro || msgPadrao, "erro");
    return true;
  }
  return false;
}
