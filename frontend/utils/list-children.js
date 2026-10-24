import { escapeHtml } from './escape-html.js'

export function renderChildSelect(container, children, { selectedId, onChange }) {
  const select = document.createElement("select")
  select.innerHTML = children
    .map(c => `<option value="${c.id}" ${c.id == selectedId ? "selected" : ""}>${escapeHtml(c.name)}</option>`)
    .join("")
  select.addEventListener("change", () => onChange(select.value))
  container.replaceChildren(select)
}

export function renderChildRadios(container, children, { selectedId, onChange }) {
  // mesma ideia com <input type="radio">
}
