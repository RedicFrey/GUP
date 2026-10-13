// ========================================
// Faz o redirecionamento
// ========================================

document.addEventListener("DOMContentLoaded", async() => {
  const { dados } = await apiFetch("/perfil/me");

  if (!dados || !dados.logado) {
    window.location.href = "auth.html";
    return;
  }

  if (!dados.tem_familia) {
    window.location.href = "auth.html";
    return;
  }

  window.location.href = "dashboard.html";
})