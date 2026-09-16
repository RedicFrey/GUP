// ========================================
// Faz o redirecionamento
// ========================================

document.addEventListener("DOMContentLoaded", async() => {
  const { dados } = await apiFetch("/auth-usuarios/me");

  if (!dados || !dados.logado) {
    window.location.href = "cadastro.html";
    return;
  }

  if (!dados.tem_familia) {
    window.location.href = "lobby.html";
    return;
  }

  window.location.href = "dashboard.html";
})