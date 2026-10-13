
const WINDOWS_KEY = `tela_atual:${location.pathname}`;

export function showWindow(idWindow, seletorSections = "main > section") {
  const tela = document.getElementById(idWindow);
  if (!tela) {
    console.warn(`Tela "${idWindow}" não encontrada.`);
    return false;                      // não esconde nada se a tela não existe
  }

  document.querySelectorAll(seletorSections)
    .forEach(section => section.classList.add("nao-visivel"));
  tela.classList.remove("nao-visivel");

  try {
    sessionStorage.setItem(WINDOWS_KEY, idWindow);
  } catch {
    // ambiente sem sessionStorage
  }
  return true;
}

export function restoreWindow(telaPadrao, seletorSecoes = "main > section") {
  let salva = null;
  try {
    salva = sessionStorage.getItem(WINDOWS_KEY);
  } catch {
    // ambiente sem sessionStorage
  }

  // se a tela salva não existir mais, cai na padrão
  if (salva && showWindow(salva, seletorSecoes)) return;
  showWindow(telaPadrao, seletorSecoes);
}

export function cleanWindow() {
  try {
    sessionStorage.removeItem(WINDOWS_KEY);
  } catch {
    // ambiente sem sessionStorage
  }
}

// onNavigate(idDaTela) roda depois de trocar de tela (útil para limpar mensagens)
export function activeNavByClick(onNavigate) {
  document.querySelectorAll("[data-ir-para]").forEach(botao => {
    botao.addEventListener("click", (event) => {
      event.preventDefault();
      if (showWindow(botao.dataset.irPara)) onNavigate?.(botao.dataset.irPara);
    });
  });
}