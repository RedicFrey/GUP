const menuNav = document.querySelector("#menu-nav");
const acoesTopo = document.querySelector("#acoes-topo");
const tituloTarefas = document.querySelector("#titulo-tarefas");
const listaTarefas = document.querySelector("#lista-tarefas");
const secaoEventos = document.querySelector("#secao-eventos");
const listaEventos = document.querySelector("#lista-eventos");
const mensagem = document.querySelector("#mensagem");
const infoUsuario = document.querySelector("#info-usuario");
const metaEscolhida = document.querySelector("#meta-escolhida");

function montarMenu(tipoUsuario) {
  const links = [
    { href: "recompensa.html", texto: "Recompensas" },
    { href: "historico.html", texto: "Histórico" },
    { href: "conta_familia.html", texto: "Conta Família" },
    { href: "perfil.html", texto: "Perfil"},
    { href: "resgates_feito.html", texto: "Resgates"}
  ];

  if (tipoUsuario === "responsavel") {
    // se for do tipo responsavel, coloca o link do relatorio e injeta dentro da lista
    links.push({ href: "relatorio.html", texto: "Relatório de Desempenho" },
      { href: "notificacao.html", texto: "Notificacao"}
    );
  }

  menuNav.innerHTML = links
    .map((l) => `<a href="${l.href}">${l.texto}</a>`)
    .join("");

  // cria um elemento do zero
  // como é sair, não redireciona
  // pega o css com o nome perigo
  // usa o text content para mudar o conteúdo
  const sair = document.createElement("a");
  sair.href = "#";
  sair.className = "perigo";
  sair.textContent = "Sair da conta";
  sair.addEventListener("click", async (evento) => {
    evento.preventDefault();
    await apiFetch("/auth-usuarios/logout", { method: "POST" });
    window.location.href = "login.html";
  });
  menuNav.appendChild(sair);
}

function mostrarRecompensa(info_meta) {

  if (!info_meta) {
    return;
  }

  if (info_meta != null) {
    metaEscolhida.innerHTML = 
      `<h2>${info_meta.nome}</h2>
      <p>${info_meta.moedas_atuais} / ${info_meta.custo}</p>`;
    };
  }

function renderizarTarefasResponsavel(grupos) {
  const { pendentes = [], atrasadas = [], em_analise = [], concluidas = [] } = grupos;

  if (!pendentes.length && !atrasadas.length && !em_analise.length && !concluidas.length) {
    listaTarefas.innerHTML = "<p>Nenhuma tarefa criada para a sua família ainda.</p>";
    return;
  }

  function renderizarCard(tarefa) {
    let acoesHtml = "";

    if (tarefa.status === "espera") {
      const foto = tarefa.foto_comprovacao
        ? `<img src="${API_URL}/static/${tarefa.foto_comprovacao}" alt="Comprovação da tarefa">`
        : "";

      acoesHtml = `
        <p>⚠️ <strong>Atenção:</strong> Uma criança marcou esta tarefa como concluída.</p>
        ${foto}
        <div class="acoes">
          <button class="sucesso" data-id="${tarefa.id}" data-status="concluida">✅ Aprovar Tarefa</button>
          <button class="perigo" data-id="${tarefa.id}" data-status="pendente">❌ Recusar (Mandar refazer)</button>
        </div>
      `;
    }

    return `
      <div class="tarefa-card">
        <h3>${tarefa.titulo}</h3>
        <p>${tarefa.descricao || ""}</p>
        <p>Status: <strong>${tarefa.status}</strong></p>
        ${acoesHtml}
      </div>
    `;
  }

  function renderizarSecao(titulo, lista) {
    if (!lista.length) return "";
    return `
      <h3 class="secao-status">${titulo}</h3>
      ${lista.map(renderizarCard).join("")}
    `;
  }

  listaTarefas.innerHTML =
    renderizarSecao("⏰ Atrasadas", atrasadas) +
    renderizarSecao("🔍 Em Análise", em_analise) +
    renderizarSecao("📋 Pendentes", pendentes) +
    renderizarSecao("✅ Concluídas", concluidas);

  listaTarefas.querySelectorAll("button[data-id]").forEach((botao) => {
    botao.addEventListener("click", () => atualizarStatusTarefa(botao.dataset.id, botao.dataset.status));
  });
}

function renderizarTarefasCrianca(tarefas) {
  if (!tarefas.length) {
    listaTarefas.innerHTML = "<p>Você não tem nenhuma tarefa no momento! Oba!</p>";
    return;
  }

  listaTarefas.innerHTML = tarefas
    .map((tarefa) => {
      let acoesHtml = "";

      if (tarefa.status === "pendente") {
        acoesHtml = `
          <form class="form-concluir" data-id="${tarefa.id}">
            <label>Envie uma foto como comprovação:</label>
            <input type="file" name="foto_comprovacao" accept="image/*" required>
            <button type="submit">Concluir (Enviar para Análise)</button>
          </form>
        `;
      } else if (tarefa.status === "espera") {
        acoesHtml = "<p><em>⏳ Aguardando aprovação do responsável...</em></p>";
      } else if (tarefa.status === "concluida") {
        acoesHtml = "<p><em>✅ Tarefa Aprovada!</em></p>";
      }

      return `
        <div class="tarefa-card">
          <h3>${tarefa.titulo}</h3>
          <p>${tarefa.descricao || ""}</p>
          <p>Moedas: ${tarefa.moedas_ganha}</p>
          <p>Status: <strong>${tarefa.status}</strong></p>
          ${acoesHtml}
        </div>
      `;
    })
    .join("");

  listaTarefas.querySelectorAll(".form-concluir").forEach((form) => {
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const arquivo = form.querySelector('input[type="file"]').files[0];
      const formData = new FormData();
      formData.append("novo_status", "espera");
      formData.append("foto_comprovacao", arquivo);

      const { ok, dados } = await apiFetch(`/tarefas/${form.dataset.id}/status`, {
        method: "POST",
        body: formData,
      });

      if (!ok) {
        mostrarMensagem(mensagem, dados?.erro || "Erro ao enviar comprovação.", "erro");
        return;
      }

      carregarDashboard();
    });
  });
}

async function atualizarStatusTarefa(id, novoStatus) {
  const formData = new FormData();
  formData.append("novo_status", novoStatus);

  const { ok, dados } = await apiFetch(`/tarefas/${id}/status`, {
    method: "POST",
    body: formData,
  });

  if (!ok) {
    mostrarMensagem(mensagem, dados?.erro || "Erro ao atualizar tarefa.", "erro");
    return;
  }

  carregarDashboard();
}

function renderizarEventos(eventos) {
  if (!eventos.length) {
    listaEventos.innerHTML = "<p>Nenhum evento criado na agenda ainda.</p>";
    return;
  }

  listaEventos.innerHTML = eventos
    .map(
      (evento) => `
        <div class="tarefa-card">
          <h3>📅 ${evento.titulo}</h3>
          <p><strong>Data</strong> ${formatarData(evento.data)}</p>
          ${evento.descricao ? `<p><strong>Descrição:</strong> ${evento.descricao}</p>` : ""}
        </div>
      `
    )
    .join("");
}

async function carregarDashboard() {
  const { ok, status, dados } = await apiFetch("/dashboard");

  if (status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (!ok) {
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar o dashboard.", "erro");
    return;
  }

  if (!dados.tem_familia) {
    window.location.href = "lobby.html";
    return;
  }

  infoUsuario.innerHTML = `
    <h1>${dados.nome}</h1>
    <p><strong>Email:</strong> ${dados.email}</p>
  `;

  montarMenu(dados.tipo_usuario);

  if (dados.tipo_usuario === "responsavel") {
    tituloTarefas.textContent = "Controle de Tarefas (Aprovação)";
    acoesTopo.innerHTML = '<a class="botao-link" href="tarefa.html">Criar tarefa</a>';
    renderizarTarefasResponsavel(dados.tarefas);
    secaoEventos.style.display = "block";
    renderizarEventos(dados.eventos);
  } else {
    tituloTarefas.textContent = "Minhas Tarefas";
    mostrarRecompensa(dados.info_meta)
    renderizarTarefasCrianca(dados.tarefas);
  }
}

carregarDashboard();
