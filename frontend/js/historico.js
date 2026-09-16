const filtroCriancas = document.querySelector("#filtro-criancas");
const filtroTipoEl = document.querySelector("#filtro-tipo");
const conteudoHistorico = document.querySelector("#conteudo-historico");
const mensagem = document.querySelector("#mensagem");

function idCriancaDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("crianca_id");
}

function filtroDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("filtro"); // "entrada", "saida", ou null
}

function renderizarFiltro(criancas, ehResponsavel, criancaAtualId, filtroAtual) {
  if (!ehResponsavel || !criancas.length) {
    filtroCriancas.innerHTML = "";
    return;
  }

  filtroCriancas.innerHTML =
    "<strong>Ver histórico de:</strong> " +
    criancas
      .map((c) => {
        const params = new URLSearchParams();
        params.set("crianca_id", c.id);
        if (filtroAtual) params.set("filtro", filtroAtual);
        const ativo = c.id == criancaAtualId ? "ativo" : "";
        return `<a class="chip ${ativo}" href="historico.html?${params.toString()}">${c.nome}</a>`;
      })
      .join(" ");
}

function renderizarFiltroTipo(criancaId, filtroAtual) {
  const opcoes = [
    { valor: null, label: "Todos" },
    { valor: "entrada", label: "Entradas" },
    { valor: "saida", label: "Saídas" },
  ];

  filtroTipoEl.innerHTML =
    "<strong>Mostrar:</strong> " +
    opcoes
      .map((o) => {
        const params = new URLSearchParams();
        if (criancaId) params.set("crianca_id", criancaId);
        if (o.valor) params.set("filtro", o.valor);
        const ativo = o.valor === filtroAtual ? "ativo" : "";
        return `<a class="chip ${ativo}" href="historico.html?${params.toString()}">${o.label}</a>`;
      })
      .join(" ");
}

function renderizarAjuste(crianca) {
  return `
    <div class="card">
      <h4>Ajustar moedas de ${crianca.nome}</h4>
      <form id="form-ajuste">
        <label><input type="radio" name="tipo_ajuste" value="adicionar" checked> Adicionar</label>
        <label><input type="radio" name="tipo_ajuste" value="remover"> Retirar</label>

        <label for="valor-ajuste">Quantidade de moedas</label>
        <input type="number" id="valor-ajuste" min="1" required>

        <label for="motivo-ajuste">Motivo</label>
        <input type="text" id="motivo-ajuste" placeholder="Ex: Ajudou a organizar a garagem" required>

        <button type="submit">Confirmar ajuste</button>
      </form>
    </div>
  `;
}

function renderizarTabela(historico) {
  if (!historico.length) {
    return "<p>Nenhuma movimentação registrada ainda.</p>";
  }

  const linhas = historico
    .map((item) => {
      const entrada = item.tipo_valor === "entrada";
      return `
        <tr>
          <td class="${entrada ? "entrada" : "saida"}">${entrada ? "ENTRADA" : "SAÍDA"}</td>
          <td>${item.valor} moedas</td>
          <td>${item.titulo}</td>
          <td>${formatarDataEHorario(item.data_criacao)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table>
      <tr><th>Tipo</th><th>Valor</th><th>Origem</th><th>Data</th></tr>
      ${linhas}
    </table>
  `;
}

async function carregarHistorico() {
  const criancaId = idCriancaDaUrl();
  const filtro = filtroDaUrl();

  const params = new URLSearchParams();
  if (criancaId) params.set("crianca_id", criancaId);
  if (filtro) params.set("filtro", filtro);

  const query = params.toString();
  const caminho = query ? `/historicos?${query}` : "/historicos";

  const { ok, status, dados } = await apiFetch(caminho);

  if (status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (!ok) {
    conteudoHistorico.innerHTML = "";
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar histórico.", "erro");
    return;
  }

  renderizarFiltro(dados.criancas, dados.eh_responsavel, dados.crianca ? dados.crianca.id : null, filtro);

  if (!dados.crianca) {
    conteudoHistorico.innerHTML = "<p>Nenhuma criança encontrada.</p>";
    filtroTipoEl.innerHTML = "";
    return;
  }

  renderizarFiltroTipo(dados.crianca.id, filtro);

  let html = `<h3>Extrato de: ${dados.crianca.nome} (Saldo: ${dados.crianca.moedas} moedas)</h3>`;

  if (dados.eh_responsavel) {
    html += renderizarAjuste(dados.crianca);
  }

  html += renderizarTabela(dados.historico);
  conteudoHistorico.innerHTML = html;

  const formAjuste = document.querySelector("#form-ajuste");
  if (formAjuste) {
    formAjuste.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const tipoAjuste = formAjuste.querySelector('input[name="tipo_ajuste"]:checked').value;
      const valor = document.querySelector("#valor-ajuste").value;
      const motivo = document.querySelector("#motivo-ajuste").value;

      const { ok: okAjuste, dados: respostaAjuste } = await apiFetch(
        `/criancas/${dados.crianca.id}/ajustar-moedas`,
        { method: "POST", body: { tipo_ajuste: tipoAjuste, valor, motivo } }
      );

      if (!okAjuste) {
        mostrarMensagem(mensagem, respostaAjuste?.erro || "Erro ao ajustar moedas.", "erro");
        return;
      }

      carregarHistorico();
    });
  }
}

carregarHistorico();