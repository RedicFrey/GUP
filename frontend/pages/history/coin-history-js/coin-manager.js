import { apiFetch, showMessage, goToLogin } from '../../../services/api.js'
import { pixelIcon } from '../../../assets/icons/pixel-icons.js'

// Diálogo para o responsável dar ou tirar moedas fora das tarefas
export function managerCoin(dialog, data, onSaved) {
  dialog.className = "task-dialog"
  dialog.innerHTML = `
    <div class="task-dialog-head">
      <h3 class="dialog-title"></h3>
      <button type="button" class="btn btn-ghost btn-icon" data-close aria-label="Fechar">
        ${pixelIcon("close", { size: 16 })}
      </button>
    </div>
    <form id="form-manager-coin">
      <fieldset class="field">
        <legend class="visually-hidden">Tipo de ajuste</legend>
        <div class="pick-group">
          <label class="pick" for="coin-add">
            <input id="coin-add" type="radio" name="manager-type" value="add" checked>
            <span class="coin-amount">+</span> Dar moedas
          </label>
          <label class="pick" for="remove-coin">
            <input id="remove-coin" type="radio" name="manager-type" value="remove">
            <span class="coin-minus">−</span> Tirar moedas
          </label>
        </div>
      </fieldset>
      <div class="field">
        <label for="coin-amount-manager">Quantidade</label>
        <input id="coin-amount-manager" type="number" min="1" step="1" inputmode="numeric" required>
      </div>
      <div class="field">
        <label for="coin-title">Motivo</label>
        <input id="coin-title" type="text" maxlength="50" placeholder="Ajudou a vizinha com as compras" required>
      </div>
      <p id="message-erro-manager" class="mensagem"></p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
        <button type="submit" id="submit-manager-coin" class="btn-primary">Salvar ajuste</button>
      </div>
    </form>
  `
  dialog.querySelector(".dialog-title").textContent = `Ajustar moedas de ${data.name}`
  dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dialog.close()))

  const form = dialog.querySelector("#form-manager-coin")
  const messageErro = dialog.querySelector("#message-erro-manager")

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const type = form.querySelector('input[name="manager-type"]:checked').value
    const amount = Number(form.querySelector("#coin-amount-manager").value)
    const reason = form.querySelector("#coin-title").value.trim()

    const submit = form.querySelector('button[type="submit"]')
    submit.disabled = true
    const saved = await editCoins(reason, amount, type, messageErro, data.id)
    submit.disabled = false
    if (!saved) return

    dialog.close()
    onSaved?.()
  })
}

async function editCoins(reason, amount, type, message, childId) {
  const { ok, status, dados } = await apiFetch(
    `/ajustar-moedas/${childId}`,
    { method: "POST", body: { reason, amount, type } }
  )

  if (status === 401) {
    goToLogin(dados?.erro)
    return false
  }

  if (!ok) {
    showMessage(message, dados?.erro || "Não foi possível ajustar as moedas.", "erro")
    return false
  }

  return true
}
