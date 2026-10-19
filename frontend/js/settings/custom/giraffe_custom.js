// ============================================================
// Catálogo de itens da girafa
// ------------------------------------------------------------
// Rotas usadas:
//   GET   /girafas/itens/<item_type>  -> lista de itens (color | background | accessory)
//   PATCH /girafas/me                 -> atualiza a girafa da criança
// ============================================================

// Tipos aceitos na rota GET (o mesmo valor vai na URL)
const ITEM_TYPES = ["color", "background", "accessory"];
const API_BASE = "http://localhost:5000";

// Tipo da URL -> campo enviado no PATCH
const ITEM_FIELD = {
  color: "color_id",
  background: "background_id",
  accessory: "accessory_id",
};

// SVG de cadeado exibido POR CIMA da imagem quando o item está bloqueado
const LOCK_SVG = `
  <svg class="giraffe-item__lock-icon" viewBox="0 0 24 24" width="28" height="28"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
  </svg>`;

// Acessório usa a miniatura centralizada (pasta thumbs/, mesmo nome do arquivo).
// Cor e fundo continuam usando a imagem original.
function thumbUrl(itemType, imageUrl) {
  if (itemType !== "accessory") return imageUrl;
  return imageUrl.replace("/accessories/", "/thumbs/accessories/");
}

// ------------------------------------------------------------
// Rota 2: GET /girafas/itens/<item_type>
// ------------------------------------------------------------
async function listGiraffeApi(itemType) {
  if (!ITEM_TYPES.includes(itemType)) {
    throw new Error(`Tipo de item inválido: ${itemType}`);
  }

    const { ok, status, dados } = await apiFetch(`/girafas/itens/${itemType}`);
    if (!ok) {
        throw new Error(`Erro ao listar itens (${status})`);
    }
    return dados;
    
}

// ------------------------------------------------------------
// Rota 1: PATCH /girafas/me
// Recebe qualquer combinação de { color_id, background_id, accessory_id }.
// Só o que for enviado é alterado; enviar null remove (ex.: tirar o acessório).
// ------------------------------------------------------------
async function updateGiraffeApi(changes) {

    const { ok, status, dados } = await apiFetch(`/girafas/me`, {
        method: "PATCH",
        body: changes,
    });
    if (!ok) {
        throw new Error(`Erro ao atualiza itens (${status})`);
    }
    return dados;

}

// ------------------------------------------------------------
// Renderização do catálogo
// itemType   -> "color" | "background" | "accessory"
// childLevel -> nível atual da criança
// container  -> elemento onde o catálogo será desenhado
// opções (4º parâmetro, todas opcionais):
//   equippedId -> id do item que a girafa já está usando; ele recebe a borda azul
//   onChange   -> função chamada logo depois que o PATCH der certo;
//                 é por ela que a página atualiza a girafa na hora
// ------------------------------------------------------------
export async function renderGiraffeCatalog(
  itemType,
  childLevel,
  container = document.querySelector("#giraffe-catalog"),
  { equippedId = null, onChange = null } = {}
) {
  if (!container) {
    throw new Error("Container do catálogo não encontrado (#giraffe-catalog).");
  }

  let items;
  try {
    items = await listGiraffeApi(itemType);
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="giraffe-catalog__error">Não foi possível carregar os itens. Tente de novo.</p>`;
    return;
  }

  container.innerHTML = "";

  items.forEach((item) => {
    // ----------------------------------------------------------
    // COMPARAÇÃO DE NÍVEL: aqui se decide se o item está bloqueado.
    // Bloqueado = nível da criança menor que o nível exigido pelo item.
    // ----------------------------------------------------------
    const isLocked = childLevel < item.required_level;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.itemId = item.id;
    button.className = isLocked
      ? "giraffe-item giraffe-item--locked"
      : "giraffe-item giraffe-item--unlocked";

    if (itemType === "accessory") button.classList.add("giraffe-item--accessory");

    // ITEM EQUIPADO: o que a girafa já está usando ganha a classe da borda azul
    const isEquipped = item.id === equippedId;
    button.classList.toggle("giraffe-item--equipped", isEquipped);
    button.setAttribute("aria-pressed", String(isEquipped));

    const img = document.createElement("img");
    img.className = "giraffe-item__image";
    img.src = `${API_BASE}${thumbUrl(itemType, item.image_url)}`;
    img.alt = item.name;
    button.appendChild(img);

    if (isLocked) {
      // ----- BLOQUEADO: SVG do cadeado por cima da imagem -----
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.title = `Desbloqueia no nível ${item.required_level}`;

      const overlay = document.createElement("span");
      overlay.className = "giraffe-item__lock";
      overlay.innerHTML = `${LOCK_SVG}<small>Nível ${item.required_level}</small>`;
      button.appendChild(overlay);
    } else {
      // ----- DESBLOQUEADO: só a imagem, clicável para equipar -----
      button.addEventListener("click", () =>
        handleSelectItem(itemType, item, container, onChange)
      );
    }

    container.appendChild(button);
  });
}

// ------------------------------------------------------------
// Clique em um item desbloqueado:
// 1) envia só o campo daquele tipo no PATCH
// 2) marca o item como selecionado
// 3) chama onChange para a página redesenhar a girafa na hora
// ------------------------------------------------------------
async function handleSelectItem(itemType, item, container, onChange) {
  try {
    await updateGiraffeApi({ [ITEM_FIELD[itemType]]: item.id });

    // Move a borda azul para o item que acabou de ser equipado
    container.querySelectorAll(".giraffe-item--equipped").forEach((el) => {
      el.classList.remove("giraffe-item--equipped");
      el.setAttribute("aria-pressed", "false");
    });
    const clicked = container.querySelector(`[data-item-id="${item.id}"]`);
    clicked?.classList.add("giraffe-item--equipped");
    clicked?.setAttribute("aria-pressed", "true");

    // Atualização imediata da girafa (só roda se a página passou o callback)
    if (onChange) await onChange();
  } catch (error) {
    console.error(error);
  }
}



// Para remover um acessório: updateGiraffeApi({ accessory_id: null });

/* CSS de referência (coloque no seu arquivo de estilos)

.giraffe-item { border: 3px solid transparent; border-radius: 12px; }   // reserva o espaço da borda
.giraffe-item--equipped { border-color: #2563eb; }                      // borda azul no item equipado

*/