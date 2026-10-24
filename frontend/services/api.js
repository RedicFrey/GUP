
export const API_URL = "http://127.0.0.1:5000";

// Pasta "frontend" calculada a partir deste arquivo (services/api.js).
// Assim os links funcionam de qualquer jeito que o servidor for aberto:
// na raiz do projeto, dentro de frontend/ ou numa pasta acima.
export const FRONT_ROOT = new URL("../", import.meta.url);

// pageUrl("pages/home/dashboard.html") -> endereço completo da página
export const pageUrl = (path) => new URL(path, FRONT_ROOT).href;

// Páginas usadas em redirecionamentos
export const PAGES = {
  auth: pageUrl("pages/auth/auth.html"),
  profiles: pageUrl("pages/chose-profile/profiles.html"),
  home: pageUrl("pages/home/dashboard.html"),
};

const OFFLINE_MESSAGE =
  `Não foi possível falar com o servidor em ${API_URL}. Confira se o backend (python app.py) está rodando.`;

export async function apiFetch(caminho, opcoes = {}) {
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
    // backend desligado, porta errada ou CORS: avisa na tela em vez de deixar a página vazia
    showOfflineBanner();
    return { ok: false, status: 0, dados: { erro: OFFLINE_MESSAGE } };
  }

  const dados = await resposta.json().catch(() => null);
  return { ok: resposta.ok, status: resposta.status, dados };
}

// Faixa fixa no topo da página. Usa estilo próprio para aparecer mesmo se o CSS não carregar.
export function showOfflineBanner() {
  if (document.querySelector("#gup-offline")) return;
  const banner = document.createElement("div");
  banner.id = "gup-offline";
  banner.setAttribute("role", "alert");
  banner.textContent = OFFLINE_MESSAGE;
  banner.style.cssText = [
    "position:fixed", "left:0", "right:0", "bottom:0", "z-index:5000",
    "padding:12px 16px", "background:#ff6b7a", "color:#2a0007",
    "font:600 14px/1.4 system-ui,sans-serif", "text-align:center",
  ].join(";");
  document.body.append(banner);
}

export function showMessage(elemento, texto, tipo) {
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `mensagem ${tipo}`;
}

// Sessão expirada: logado na conta mas sem perfil vai para a escolha de perfil,
// sem login nenhum vai para a tela de entrada.
export function goToLogin(erro = "") {
  const semPerfil = /perfil/i.test(erro);
  window.location.href = semPerfil ? PAGES.profiles : PAGES.auth;
}

// Imagens que o backend serve em /static (girafa, comprovações)
export function assetUrl(path = "") {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}/${String(path).replace(/\\/g, "/").replace(/^\/+/, "")}`;
}
