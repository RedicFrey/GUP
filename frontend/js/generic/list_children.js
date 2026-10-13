
export function showChildren(children, childNowId, filter, div, text, urlBase) {

  div.innerHTML =
    text +
    children
      .map((c) => {
        const params = new URLSearchParams();
        params.set("child_id", c.id);
        if (filter) params.set("filtro", filter);
        const active = c.id == childNowId ? "ativo" : "";
        return `<a class="chip ${active}" href="${urlBase}?${params.toString()}">${c.name}</a>`;
      })
      .join(" ");
}

// async function childrenApi(){
//   const { ok, status, dados } = await apiFetch("/perfis-conta-familia/criancas")
//   return dados
// }

// export async function showChildrenTypeSelect(selectContainer){
//   const result = await childrenApi()
//   selectContainer.innerHTML = result.map((child)=>
//     `<option value="${child.id}">${child.name}<option>`).join("")
// }

async function childrenApi(){
  const { ok, dados } = await apiFetch("/perfis-conta-familia/criancas")
  return ok && Array.isArray(dados) ? dados : []
}
 
export async function showChildrenTypeSelect(select, { children, selectedId, allLabel, onChange } = {}) {

  const list = children ?? await childrenApi();
  const current = String(selectedId ?? list[0]?.id ?? "");

  const options = list.map((child) => {
    const label = child.nome || child.name || "Sem nome";
    const value = child.id ?? "";
    return new Option(label, value, false, String(value) === current);
  });
 
  if (allLabel) {
    options.unshift(new Option(allLabel, "", false, current === ""));
  }

  select.replaceChildren(...options);
 
  if (onChange) {
    select.onchange = () => onChange(select.value);
  }
 
  console.log(select)
  return select; 
}

