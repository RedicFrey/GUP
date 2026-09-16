const filtroCriancas = document.querySelector("#filtro-criancas");
const listaResgates = document.querySelector("#lista-resgates");
const mensagem = document.querySelector("#mensagem");

let paginaAtual = 1;
let totalDePaginas = 1;

function idCriancaDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("crianca_id");
}

function renderizarFiltro(criancas, criancaAtualId) {
  if (!criancas.length) {
    filtroCriancas.innerHTML = "";
    return;
  }

  filtroCriancas.innerHTML =
    "<strong>Ver resgates de:</strong> " +
    criancas
      .map((c) => {
        const params = new URLSearchParams();
        params.set("crianca_id", c.id);
        const ativo = c.id == criancaAtualId ? "ativo" : "";
        return `<a class="chip ${ativo}" href="resgates_feito.html?${params.toString()}">${c.nome}</a>`;
      })
      .join(" ");
}

function renderizarResgates(resgates) {
  if (!resgates.length) {
    return "<p>Nenhum resgate realizado ainda.</p>";
  }

  return resgates
    .map(
      (r) => `
        <div class="resgates-realizados">
          <p class="nome-resgate">${r.nome}</p>
          <p>${r.custo} moedas — ${formatarDataEHorario(r.data_criacao)}</p>
        </div>
      `
    )
    .join("");
}

async function carregarResgates() {
  const criancaId = idCriancaDaUrl();

  const params = new URLSearchParams();
  if (criancaId) params.set("crianca_id", criancaId);
  params.set("pagina", paginaAtual);

  const { ok, status, dados } = await apiFetch(`/resgates_feitos?${params.toString()}`);

  if (status === 401) {
    window.location.href = "login.html";
    return;
  }

  if (!ok) {
    listaResgates.innerHTML = "";
    mostrarMensagem(mensagem, dados?.erro || "Erro ao carregar resgates.", "erro");
    return;
  }

  paginaAtual = dados.pagina_atual;
  totalDePaginas = dados.total_paginas;
  document.getElementById("info-pagina").textContent = `Página ${paginaAtual} de ${totalDePaginas}`;

  renderizarFiltro(dados.criancas, criancaId);
  listaResgates.innerHTML = renderizarResgates(dados.dados);
}

function mudarPagina(direcao) {
  const novaPagina = paginaAtual + direcao;

  if (novaPagina >= 1 && novaPagina <= totalDePaginas) {
    paginaAtual = novaPagina;
    carregarResgates();
  }
}

function irParaPagina(numero) {
  paginaAtual = numero;
  carregarResgates();
}

function irParaUltimaPagina() {
  paginaAtual = totalDePaginas;
  carregarResgates();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarResgates();
});