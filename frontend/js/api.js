// =======================================================
// Funções globais (script clássico, sem import/export).
// Vários módulos ainda usam apiFetch / mostrarMensagem / erroMensagem
// sem importar, então toda página carrega este arquivo primeiro.
// A versão em módulo fica em services/api.js.
// =======================================================
const API_URL = "http://127.0.0.1:5000";

// Aberto como "localhost"? O cookie de login só funciona com 127.0.0.1 (o mesmo
// endereço da API), então trocamos sozinhos em vez de deixar o login falhar.
if (location.hostname === "localhost") {
  location.replace(location.href.replace("//localhost", "//127.0.0.1"));
}

// calculado a partir deste arquivo (js/api.js): funciona de qualquer pasta
const AUTH_PAGE = new URL("../pages/auth/auth.html", document.currentScript?.src ?? location.href).href;
const OFFLINE_MESSAGE =
  `Não foi possível falar com o servidor em ${API_URL}. Confira se o backend (python app.py) está rodando.`;

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

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, configuracao);
  } catch {
    // backend desligado: devolve um erro legível em vez de travar a página
    return { ok: false, status: 0, dados: { erro: OFFLINE_MESSAGE } };
  }
  const dados = await resposta.json().catch(() => null);
  return { ok: resposta.ok, status: resposta.status, dados };
}

// =======================================================
// Mensagem de erro / sucesso
// =======================================================
function mostrarMensagem(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `mensagem ${tipo}`;
}

async function exigirLogin() {
  const { dados } = await apiFetch("/perfil/me");
  if (!dados || !dados.id) {
    window.location.href = AUTH_PAGE;
    return null;
  }
  return dados;
}

// =======================================================
// Datas: o banco guarda horário sem fuso e o Flask manda como
// "... GMT". Lemos os números como estão (ver utils/formatar.js).
// =======================================================
function lerDataDaApi(valor) {
  if (!valor) return null;
  const texto = String(valor).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) {
    const [, y, mo, d, h = 0, mi = 0, s = 0] = iso;
    return new Date(+y, +mo - 1, +d, +h, +mi, +s);
  }
  const data = new Date(texto);
  if (isNaN(data)) return null;
  if (/GMT$/.test(texto)) {
    return new Date(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(),
      data.getUTCHours(), data.getUTCMinutes(), data.getUTCSeconds());
  }
  return data;
}

function formatarDataEHorario(isoString) {
  const data = lerDataDaApi(isoString);
  if (!data) return "—";
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function formatarData(dataString) {
  const data = lerDataDaApi(dataString);
  if (!data) return "—";
  return data.toLocaleDateString("pt-BR");
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
