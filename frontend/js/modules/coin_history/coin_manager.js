export function managerCoin(dialog, data, onSaved) {
  dialog.innerHTML = ""   // evita duplicar conteúdo se for chamado de novo

  const divBtnBack = document.createElement("div")
  const btnBack = document.createElement("button")
  btnBack.type = "button"
  btnBack.textContent = "Fechar"
  btnBack.addEventListener("click", () => dialog.close())
  divBtnBack.append(btnBack)

  const divMain = document.createElement("div")
  divMain.innerHTML = `
    <h4>Ajustar moedas de: ${data.name}</h4>
    <form id="form-manager-coin">
      <div>
        <label for="coin-add">
          <input id="coin-add" type="radio" name="manager-type" value="add" checked> Adicionar
        </label>
        <label for="remove-coin">
          <input id="remove-coin" type="radio" name="manager-type" value="remove"> Remover
        </label>
      </div>
      <div>
        <label for="coin-amount-manager">Quantidade:</label>
        <input id="coin-amount-manager" type="number" min="1" required>
      </div>
      <div>
        <label for="coin-title">Motivo</label>
        <input id="coin-title" type="text" required>
      </div>
      <button type="submit" id="submit-manager-coin">Enviar</button>
    </form>
    <p id="message-erro-manager"></p>
  `

  const form = divMain.querySelector("#form-manager-coin")
  const messageErro = divMain.querySelector("#message-erro-manager")

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const type = form.querySelector('input[name="manager-type"]:checked').value
    const amount = Number(form.querySelector("#coin-amount-manager").value)
    const reason = form.querySelector("#coin-title").value.trim()

    const saved = await editCoins(reason, amount, type, messageErro, data.id)
    if (!saved) return   // deu erro: mantém o modal aberto

    dialog.close()
    onSaved?.()
  })

  dialog.append(divBtnBack, divMain)
}

async function editCoins(reason, amount, type, message, childId) {
  const { ok, status, dados } = await apiFetch(
    `/ajustar-moedas/${childId}`,
    { method: "POST", body: { reason, amount, type } }
  )

  if (status === 401) {
    window.location.href = "auth.html"
    return false
  }

  if (!ok) {
    mostrarMensagem(message, dados?.erro || "Erro ao ajustar moedas.", "erro")
    return false
  }

  return true
}