// Mantenha aqui o import do apiFetch que você já usa neste arquivo
// import { apiFetch } from "...";

const API_BASE = "http://localhost:5000";

const CORES = { amarelo: "#F4C430", marrom: "#8B5A2B", rosa: "#F4A6C0",
                branco: "#FFFFFF", azul: "#5B9BD5", prata: "#C0C0C0" };

// ------------------------------------------------------------
// Desenha a girafa.
// section -> onde desenhar
// giraffe -> (NOVO, opcional) dados já carregados. Se vier, não faz outro GET;
//            se não vier, busca em /girafas/me como antes.
// ------------------------------------------------------------
export async function viewGiraffe(
  section = document.querySelector(".giraffe-view-section"),
  giraffe = null
) {
  try {
    const response = giraffe ?? (await giraffeApi());
    console.log(giraffe)

    // Acessório é opcional (pode ser null)
    const acessorio = response.accessory
      ? `<img class="camada girafa-acessorio" id="girafa-acessorio" src="${API_BASE}${response.accessory.image_url}" alt="Acessório">`
      : "";

    section.innerHTML = `
      <img class="camada girafa-fundo" id="girafa-fundo" src="${API_BASE}${response.background.image_url}" alt="Fundo">
      <img class="camada girafa-cor" id="girafa-cor" src="${API_BASE}${response.color.image_url}" alt="Cor girafa">
      ${acessorio}
    `;

  } catch (error) {
    // Antes o catch ficava vazio e escondia qualquer erro de renderização
    console.error("Erro ao desenhar a girafa:", error);
  }
}

// GET /girafas/me -> { id, child_profile_id, color, background, accessory }
export async function giraffeApi() {
  const { ok, status, dados } = await apiFetch(`/girafas/me`);

  if (status === 403) {
    window.location.href = "auth.html";
  }

  if (!ok) {
    throw new Error(`Erro ao carregar a girafa (${status})`);
  }
  return dados;
}