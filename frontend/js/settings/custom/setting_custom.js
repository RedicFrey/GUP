import { loadMyProfile } from '../../generic/utils.js'
import { renderGiraffeCatalog } from './giraffe_custom.js'
import { giraffeApi } from './giraffe.js'
import { viewGiraffe } from '../../components/giraffe.js'
import { ICONS } from '../../generic/icons.js'

const customContaint = document.querySelector("#custom-containt")

// Página de configurações
export function sectionCustomPage(section, profileType){
    if (profileType === "responsible") return

    section.innerHTML = `
        <p>Alterar girafa</p>
        <div><a href="custom.html">Mudar</a></div>
    `
}

// Tipo que aparece selecionado assim que a página abre
const DEFAULT_ITEM_TYPE = "accessory";

async function pageCustom() {
  const profileOption = options();

  customContaint.innerHTML = `
    <div id="div-back"><a href="setting.html" id="back-to-setting">${ICONS.generic.back} Voltar</a></div>
    <section class="giraffe-view-section"></section>
    <section>
      <div id="customization-panel">
        <ul class="category-list" id="category-list">
          ${profileOption.map(action => `
            <li>
              <button
                type="button"
                class="btn-acao"
                data-type="${action.type}"
                aria-pressed="false"
              >
                ${action.name}
              </button>
            </li>
          `).join("")}
        </ul>
      </div>
      <section id="giraffe-section">
            <div id="giraffe-catalog"></div>
      </section>
    </section>
  `;

  const giraffeSection = customContaint.querySelector(".giraffe-view-section");
  const catalog = customContaint.querySelector("#giraffe-catalog");
  const buttons = customContaint.querySelectorAll(".btn-acao");

  const profile = await loadMyProfile();

  // Guarda a girafa atual (cor, fundo e acessório equipados).
  // É daqui que sai o id do item que recebe a borda azul.
  let giraffe = null;

  // Busca a girafa de novo e redesenha a view.
  // É passada como onChange: roda logo depois que a criança troca um item.
  async function refreshGiraffe() {
    giraffe = await giraffeApi();
    await viewGiraffe(giraffeSection, giraffe);
  }

  // Mostra o catálogo de um tipo e marca o botão correspondente como ativo
  async function showCatalog(type) {
    buttons.forEach(btn => {
      const isActive = btn.dataset.type === type;
      btn.classList.toggle("btn-acao--active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    if (profile.profile_type !== "child") return;
    // else: aqui entra o fluxo de outros perfis (ex.: pai/responsável)

    // A girafa só é carregada e desenhada na primeira vez.
    // Trocar de aba (Cor, Fundo...) não precisa redesenhar nada.
    if (!giraffe) await refreshGiraffe();

    await renderGiraffeCatalog(type, profile.level_id, catalog, {
      // giraffe.accessory pode ser null, por isso o "?."
      equippedId: giraffe[type]?.id ?? null,
      onChange: refreshGiraffe,
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => showCatalog(btn.dataset.type));
  });

  // Carregamento inicial: abre já em "Acessório"
  showCatalog(DEFAULT_ITEM_TYPE);
}

function options(type = "child") {
  if (type === "child") {
    return [
      { name: "Acessório", type: "accessory" },
      { name: "Cor", type: "color" },
      { name: "Fundo", type: "background" },
    ];
  }
  return [];
}

document.addEventListener("DOMContentLoaded", () => {
  // Este arquivo também é importado pela página de configurações, onde
  // #custom-containt não existe. Sem essa guarda, dá TypeError lá.
  if (!customContaint) return;
  pageCustom();
});