document.addEventListener("DOMContentLoaded", async() => {
  const usuario = await exigirLogin();
  if (!usuario) return;

  if (usuario.tem_familia) {
    window.location.href = "dashboard.html";
  }

  document.querySelector("#link-logout").addEventListener("click", async (evento) => {
  evento.preventDefault();
  await apiFetch("/auth-usuarios/logout", { method: "POST" });
  window.location.href = "login.html";
});
})

