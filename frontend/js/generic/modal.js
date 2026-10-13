// generic_modal.js

export function openFormModal(modalEl, { title, fields, confirmLabel = "Confirmar", onConfirm }) {
  modalEl.innerHTML = `
    <form id="generic-modal-form">
      <h3>${title}</h3>

      ${fields.map(campo => `
        <label for="${campo.id}">${campo.label}</label>
        <input type="${campo.type || "text"}" id="${campo.id}" ${campo.maxlength ? `maxlength="${campo.maxlength}"` : ""} ${campo.required ? "required" : ""}>
      `).join("")}

      <p id="generic-modal-erro"></p>

      <button type="submit">${confirmLabel}</button>
      <button type="button" id="generic-modal-cancelar">Cancelar</button>
    </form>
  `;

  const form = modalEl.querySelector("#generic-modal-form");
  const erroEl = modalEl.querySelector("#generic-modal-erro");

  modalEl.querySelector("#generic-modal-cancelar").addEventListener("click", () => modalEl.close());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    erroEl.textContent = "";

    const values = {};
    fields.forEach(campo => {
      values[campo.id] = form.querySelector(`#${campo.id}`).value;
    });

    try {
      await onConfirm(values);
      modalEl.close();
    } catch (erro) {
      erroEl.textContent = erro.message || "Ocorreu um erro.";
    }
  });

  modalEl.showModal();
}