import { apiFetch, assetUrl, goToLogin } from '../../services/api.js'
import { escapeHtml } from '../../utils/escape-html.js'

// ------------------------------------------------------------
// A girafa tem 3 camadas: fundo (cenário), cor (o corpo) e acessório.
// giraffeSprite -> só o corpo + acessório (fundo transparente)
// viewGiraffe   -> a cena completa, com o cenário atrás
// ------------------------------------------------------------

export function giraffeSprite(giraffe, { className = "" } = {}) {
  if (!giraffe?.color?.image_url) return ""

  const accessory = giraffe.accessory?.image_url
    ? `<img class="giraffe-layer giraffe-accessory" src="${escapeHtml(assetUrl(giraffe.accessory.image_url))}" alt="">`
    : ""

  return `
    <span class="giraffe-sprite ${className}" role="img" aria-label="Sua girafa">
      <img class="giraffe-layer giraffe-color" src="${escapeHtml(assetUrl(giraffe.color.image_url))}" alt="">
      ${accessory}
    </span>`
}

// Desenha a cena completa dentro de `section`.
// giraffe -> dados já carregados (opcional); sem eles busca em /girafas/me.
export async function viewGiraffe(
  section = document.querySelector(".giraffe-view-section"),
  giraffe = null
) {
  try {
    const data = giraffe ?? (await giraffeApi())
    section.classList.add("giraffe-scene")

    const background = data.background?.image_url
      ? `<img class="giraffe-scene-bg" src="${escapeHtml(assetUrl(data.background.image_url))}" alt="">`
      : ""

    section.innerHTML = `${background}${giraffeSprite(data, { className: "giraffe-scene-sprite" })}`
  } catch (error) {
    console.error("Erro ao desenhar a girafa:", error)
    section.innerHTML = `<p class="giraffe-scene-error">Não foi possível mostrar a girafa agora.</p>`
  }
}

// GET /girafas/me -> { id, child_profile_id, color, background, accessory }
export async function giraffeApi() {
  const { ok, status, dados } = await apiFetch(`/girafas/me`)

  if (status === 401) {
    goToLogin(dados?.erro)
  }

  if (!ok) {
    throw new Error(`Erro ao carregar a girafa (${status})`)
  }
  return dados
}
