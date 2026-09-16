/* =========================================================
   App Família — lógica única do protótipo
   Tudo roda no navegador, com estado salvo em localStorage.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. Ícones (SVG inline — sem dependência externa)
     --------------------------------------------------------- */

  var T = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  var ICONES = {
    sino:        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    voltar:      '<path d="M15 18l-6-6 6-6"/>',
    avancar:     '<path d="M9 18l6-6-6-6"/>',
    'seta-esq':  '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
    'seta-cima': '<path d="M6 15l6-6 6 6"/>',
    'seta-baixo':'<path d="M6 9l6 6 6-6"/>',
    mensagem:    '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-8.9A8.4 8.4 0 1 1 21 11.5z"/>',
    editar:      '<path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    mais:        '<path d="M12 5v14M5 12h14"/>',
    menos:       '<path d="M5 12h14"/>',
    check:       '<path d="M20 6 9 17l-5-5"/>',
    x:           '<path d="M18 6 6 18M6 6l12 12"/>',
    atencao:     '<path d="M12 8v5M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    alerta:      '<path d="M12 8v5M12 17h.01"/>',
    casa:        '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    relogio:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ajustes:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.09 19a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4 8.09a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H8.4a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8.4a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    usuario:     '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    usuarios:    '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0"/><path d="M16.5 4.6a3.6 3.6 0 0 1 0 6.8"/><path d="M18 14.3A6.5 6.5 0 0 1 21.5 21"/>',
    'lupa-vazia':'<circle cx="10.5" cy="10.5" r="7.5"/><path d="M16 16l5 5"/><path d="M8.3 8.3l4.4 4.4M12.7 8.3l-4.4 4.4"/>',
    presente:    '<path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 21V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    carrinho:    '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.4a1.6 1.6 0 0 0 1.6 1.2h8.2a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/>',
    alvo:        '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    moeda:       '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-2.5-1.2"/><path d="M12 6.4v11.2"/>',
    moedas:      '<ellipse cx="12" cy="6.5" rx="8" ry="3.2"/><path d="M4 6.5v4c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-4"/><path d="M4 11.5v4c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-4"/>',
    camera:      '<path d="M3 8h3l1.6-2.4h8.8L18 8h3v12H3z"/><circle cx="12" cy="13.5" r="3.6"/>',
    enviar:      '<path d="M21 3 10.5 13.5"/><path d="M21 3l-6.8 18-3.7-7.5L3 9.8z"/>',
    sol:         '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2 12h2M20 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5"/>',
    lua:         '<path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8z"/>',
    celular:     '<rect x="6.5" y="2.5" width="11" height="19"/><path d="M10.5 18.5h3"/>',
    tablet:      '<rect x="3.5" y="2.5" width="17" height="19"/><path d="M10.5 18.5h3"/>',
    lixeira:     '<path d="M3.5 6h17"/><path d="M8 6V3.5h8V6"/><path d="M5.5 6l1 15h11l1-15"/><path d="M10 10.5v6.5M14 10.5v6.5"/>',
    sair:        '<path d="M9.5 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4.5"/><path d="M16 16.5 20.5 12 16 7.5"/><path d="M20.5 12H9"/>',
    trocar:      '<path d="M4 8h13"/><path d="M13.5 4.5 17 8l-3.5 3.5"/><path d="M20 16H7"/><path d="M10.5 12.5 7 16l3.5 3.5"/>',
    cadeado:     '<rect x="4.5" y="10.5" width="15" height="10.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    olho:        '<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'olho-corte':'<path d="M4 4l16 16"/><path d="M10 6a10.6 10.6 0 0 1 2-.2c6.2 0 10 6.2 10 6.2a16 16 0 0 1-3.2 3.7"/><path d="M6.4 8.1A16.3 16.3 0 0 0 2 12s3.8 6.2 10 6.2a10 10 0 0 0 3.5-.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    calendario:  '<rect x="3.5" y="5" width="17" height="16"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    chama:       '<path d="M12 22c4 0 7-2.7 7-6.5 0-4.8-5-6.5-4-11.5-3 1.4-5.5 4.4-5.5 7.3 0 1.4.5 2.4 1 3.2-1.4 0-2.5-1.3-2.7-2.6C6.2 13.3 5 14.8 5 16.6 5 19.6 8 22 12 22z"/>',
    raio:        '<path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z"/>',
    escudo:      '<path d="M12 22s8-3.3 8-9.5V5.2L12 2 4 5.2v7.3C4 18.7 12 22 12 22z"/><path d="M9 12.2l2.2 2.2L15.5 10"/>'
  };

  var PREENCHIDOS = { chama: 1, raio: 1 };

  function icone(nome, tam) {
    var d = ICONES[nome];
    if (!d) return '';
    var attr = PREENCHIDOS[nome] ? 'fill="currentColor" stroke="none"' : T;
    tam = tam || 20;
    return '<svg width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" ' + attr + '>' + d + '</svg>';
  }

  function pintarIcones(raiz) {
    (raiz || document).querySelectorAll('[data-ic]').forEach(function (el) {
      el.classList.add('ic');
      el.innerHTML = icone(el.getAttribute('data-ic'), el.getAttribute('data-tam'));
    });
  }

  /* ---------------------------------------------------------
     2. Estado (localStorage)
     --------------------------------------------------------- */

  var CHAVE = 'app-familia-v1';
  var agora = Date.now();
  var DIA = 86400000;

  var PADRAO = {
    usuario: { nome: 'Alessandra', email: 'alessandra@email.com', senha: 'Familia@2026', nascimento: '12/04/1990' },
    logado: true,
    conta: { criada: true, nome: 'Família Souza', pin: '2468', lider: 'Alessandra', cargoLider: 'Mãe' },
    membros: [
      { nome: 'Alessandra', cargo: 'Mãe', lider: true },
      { nome: 'Rodrigo', cargo: 'Pai' },
      { nome: 'Ana', cargo: 'Avó' }
    ],
    criancas: [
      { id: 'c1', nome: 'João', idade: 9, saldo: 1700, sequencia: 16, xp: 480 },
      { id: 'c2', nome: 'Maria', idade: 7, saldo: 980, sequencia: 5, xp: 260 }
    ],
    criancaAtual: 'c1',
    tarefas: [
      { id: 't1', nome: 'Lavar a louça', descricao: 'Depois do jantar, deixar a pia limpa.', para: ['c1'], horario: '20:00', ganhar: 150, perder: 50, atraso: 70, xp: 30, status: 'refazer', autor: 'Alessandra', quando: agora - DIA },
      { id: 't2', nome: 'Arrumar a cama', descricao: 'Antes de sair para a escola.', para: ['c1'], horario: '07:15', ganhar: 150, perder: 50, atraso: 70, xp: 30, status: 'verificar', autor: 'Rodrigo', quando: agora - 3600000 },
      { id: 't3', nome: 'Guardar os brinquedos', descricao: 'Tudo na caixa antes de dormir.', para: ['c1', 'c2'], horario: '19:30', ganhar: 150, perder: 50, atraso: 70, xp: 30, status: 'verificar', autor: 'Alessandra', quando: agora - 7200000 },
      { id: 't4', nome: 'Ler 20 minutos', descricao: 'Qualquer livro da estante.', para: ['c1'], horario: '18:00', ganhar: 150, perder: 50, atraso: 70, xp: 40, status: 'concluido', autor: 'Ana', quando: agora - DIA },
      { id: 't5', nome: 'Regar as plantas', descricao: 'Só as da varanda.', para: ['c2'], horario: '17:00', ganhar: 120, perder: 40, atraso: 60, xp: 25, status: 'pendente', autor: 'Alessandra', quando: agora }
    ],
    lancamentos: [
      { id: 'l1', crianca: 'c1', nome: 'Ler 20 minutos', valor: 150, quando: agora - DIA },
      { id: 'l2', crianca: 'c1', nome: 'Arrumar a mochila', valor: 70, quando: agora - DIA },
      { id: 'l3', crianca: 'c1', nome: 'Compra: fone de ouvido', valor: -500, quando: agora - DIA },
      { id: 'l4', crianca: 'c1', nome: 'Ajudar no mercado', valor: 70, quando: agora - 5 * 3600000 },
      { id: 'l5', crianca: 'c1', nome: 'Lição de casa em dia', valor: 80, quando: agora - 3 * 3600000 },
      { id: 'l6', crianca: 'c2', nome: 'Guardar os brinquedos', valor: 120, quando: agora - 4 * 3600000 }
    ],
    metas: [
      { id: 'm1', nome: 'PlayStation 4', preco: 2700 },
      { id: 'm2', nome: 'Roupa nova', preco: 450 },
      { id: 'm3', nome: 'Tênis', preco: 450 },
      { id: 'm4', nome: 'Mesada extra', preco: 1000 }
    ],
    alvo: 'm1',
    tema: 'escuro',
    dispositivo: 'celular'
  };

  var S;

  function carregar() {
    try {
      var bruto = localStorage.getItem(CHAVE);
      S = bruto ? JSON.parse(bruto) : null;
    } catch (e) { S = null; }
    if (!S || !S.criancas) S = JSON.parse(JSON.stringify(PADRAO));
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {}
  }

  function zerar() {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    location.reload();
  }

  carregar();
  salvar();

  /* ---------------------------------------------------------
     3. Utilitários
     --------------------------------------------------------- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function num(n) { return (n || 0).toLocaleString('pt-BR'); }
  function id() { return Math.random().toString(36).slice(2, 9); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function crianca() {
    return S.criancas.filter(function (c) { return c.id === S.criancaAtual; })[0] || S.criancas[0];
  }
  function nomeCrianca(cid) {
    var c = S.criancas.filter(function (x) { return x.id === cid; })[0];
    return c ? c.nome : '—';
  }
  function mesmoDia(a, b) {
    var x = new Date(a), y = new Date(b);
    return x.toDateString() === y.toDateString();
  }
  function rotuloDia(ts) {
    var hoje = Date.now();
    if (mesmoDia(ts, hoje)) return 'Hoje';
    if (mesmoDia(ts, hoje - DIA)) return 'Ontem';
    return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
  function hora(ts) {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  var avisoEl;
  function aviso(msg) {
    var moldura = $('.celular');
    if (!moldura) return;
    if (!avisoEl) {
      avisoEl = document.createElement('div');
      avisoEl.className = 'aviso';
      avisoEl.setAttribute('role', 'status');
      moldura.appendChild(avisoEl);
    }
    var comNav = $('.nav') && !document.body.classList.contains('tablet');
    avisoEl.style.bottom = comNav ? '80px' : '24px';
    avisoEl.textContent = msg;
    avisoEl.classList.add('visivel');
    clearTimeout(avisoEl._t);
    avisoEl._t = setTimeout(function () { avisoEl.classList.remove('visivel'); }, 2400);
  }

  function irPara(url) { setTimeout(function () { location.href = url; }, 380); }

  function param(chave) {
    return new URLSearchParams(location.search).get(chave);
  }

  function lancar(cid, nome, valor) {
    S.lancamentos.push({ id: id(), crianca: cid, nome: nome, valor: valor, quando: Date.now() });
    var c = S.criancas.filter(function (x) { return x.id === cid; })[0];
    if (c) c.saldo = Math.max(0, c.saldo + valor);
  }

  /* ---------------------------------------------------------
     4. Tema e dispositivo
     --------------------------------------------------------- */

  function aplicarTema() {
    document.body.classList.toggle('claro', S.tema === 'claro');
    $$('[data-tema]').forEach(function (el) { el.textContent = S.tema === 'claro' ? 'Claro' : 'Escuro'; });
    var b = $('#ctrl-tema');
    if (b) b.innerHTML = icone(S.tema === 'claro' ? 'lua' : 'sol', 16) + '<span>' + (S.tema === 'claro' ? 'Escuro' : 'Claro') + '</span>';
  }

  function aplicarDispositivo() {
    document.body.classList.toggle('tablet', S.dispositivo === 'tablet');
    $$('[data-dispositivo]').forEach(function (el) { el.textContent = S.dispositivo === 'tablet' ? 'Tablet' : 'Celular'; });
    var b = $('#ctrl-disp');
    if (b) b.innerHTML = icone(S.dispositivo === 'tablet' ? 'celular' : 'tablet', 16) + '<span>' + (S.dispositivo === 'tablet' ? 'Celular' : 'Tablet') + '</span>';
  }

  function alternarTema() { S.tema = S.tema === 'claro' ? 'escuro' : 'claro'; salvar(); aplicarTema(); }
  function alternarDispositivo() { S.dispositivo = S.dispositivo === 'tablet' ? 'celular' : 'tablet'; salvar(); aplicarDispositivo(); }

  function montarControles() {
    var barra = document.createElement('div');
    barra.className = 'controles';
    barra.innerHTML =
      '<button id="ctrl-tema" type="button" title="Alternar tema"></button>' +
      '<button id="ctrl-disp" type="button" title="Alternar dispositivo"></button>';
    document.body.appendChild(barra);
    $('#ctrl-tema').onclick = alternarTema;
    $('#ctrl-disp').onclick = alternarDispositivo;
  }

  /* ---------------------------------------------------------
     5. Validação simples de formulário
     --------------------------------------------------------- */

  function validar(campos) {
    var ok = true;
    campos.forEach(function (c) {
      var el = $(c.sel);
      if (!el) return;
      var caixa = el.closest('.campo') || el.parentElement;
      var valido = c.teste ? c.teste(el.value.trim()) : el.value.trim().length > 0;
      caixa.classList.toggle('erro', !valido);
      var av = $('.aviso-campo', caixa);
      if (!valido) {
        if (!av) {
          av = document.createElement('span');
          av.className = 'aviso-campo';
          caixa.appendChild(av);
        }
        av.textContent = c.msg || 'Preencha este campo.';
        ok = false;
      }
    });
    return ok;
  }

  /* ---------------------------------------------------------
     6. Páginas
     --------------------------------------------------------- */

  var paginas = {};

  /* ---- login ---- */
  paginas.login = function () {
    $('#btn-entrar').onclick = function () {
      var ok = validar([
        { sel: '#email', teste: function (v) { return /.+@.+\..+/.test(v); }, msg: 'Informe um e-mail válido.' },
        { sel: '#senha', msg: 'Informe sua senha.' }
      ]);
      if (!ok) return;
      S.logado = true;
      S.usuario.email = $('#email').value.trim();
      salvar();
      aviso('Bem-vinda de volta!');
      irPara(S.conta.criada ? 'index.html' : 'dashboard-inicial.html');
    };
    $('#email').value = S.usuario.email || '';
  };

  /* ---- cadastro ---- */
  paginas.cadastro = function () {
    var senha = $('#senha');
    var regras = [
      { sel: '#r-maiuscula', teste: function (v) { return /[A-Z]/.test(v); } },
      { sel: '#r-especial', teste: function (v) { return /[^A-Za-z0-9]/.test(v); } },
      { sel: '#r-numero', teste: function (v) { return /[0-9]/.test(v); } },
      { sel: '#r-tamanho', teste: function (v) { return v.length > 8; } }
    ];
    function conferir() {
      var v = senha.value;
      regras.forEach(function (r) {
        var el = $(r.sel);
        var ok = r.teste(v);
        el.classList.toggle('ok', ok);
        $('[data-ic]', el).innerHTML = icone(ok ? 'check' : 'x', 12);
      });
      return regras.every(function (r) { return r.teste(v); });
    }
    senha.addEventListener('input', conferir);
    conferir();

    $('#btn-cadastrar').onclick = function () {
      var ok = validar([
        { sel: '#email', teste: function (v) { return /.+@.+\..+/.test(v); }, msg: 'Informe um e-mail válido.' },
        { sel: '#nome', msg: 'Informe seu nome.' },
        { sel: '#nascimento', msg: 'Informe a data de nascimento.' },
        { sel: '#senha', teste: conferir, msg: 'A senha não cumpre todas as regras.' },
        { sel: '#confirmar', teste: function (v) { return v === senha.value && v.length > 0; }, msg: 'As senhas não são iguais.' }
      ]);
      if (!ok) return;
      S.usuario = {
        nome: $('#nome').value.trim(),
        email: $('#email').value.trim(),
        senha: senha.value,
        nascimento: $('#nascimento').value.trim()
      };
      S.logado = true;
      salvar();
      aviso('Conta criada.');
      irPara('dashboard-inicial.html');
    };
  };

  /* ---- dashboard inicial (sem conta família) ---- */
  paginas['dashboard-inicial'] = function () {
    $('#ola').textContent = 'Olá, ' + (S.usuario.nome || 'visitante');
    if (S.conta.criada) {
      $('#sem-conta').classList.add('oculto');
      $('#com-conta').classList.remove('oculto');
      $('#nome-conta').innerHTML = esc(S.conta.nome) +
        '<span>' + S.membros.length + ' responsáveis e ' + S.criancas.length + ' crianças</span>';
      $('#btn-abrir').onclick = function () { irPara('index.html'); };
      $('#btn-outra').onclick = function () { irPara('entrar-conta-familia.html'); };
    } else {
      $('#sem-conta').classList.remove('oculto');
      $('#com-conta').classList.add('oculto');
    }
  };

  /* ---- criar conta família ---- */
  paginas['criar-conta-familia'] = function () {
    $('#btn-criar').onclick = function () {
      var ok = validar([
        { sel: '#nome-conta', msg: 'Dê um nome para a conta.' },
        { sel: '#pin', teste: function (v) { return /^\d{4,8}$/.test(v); }, msg: 'O PIN deve ter de 4 a 8 números.' },
        { sel: '#cargo', msg: 'Informe seu cargo na família.' }
      ]);
      if (!ok) return;
      S.conta = {
        criada: true,
        nome: $('#nome-conta').value.trim(),
        pin: $('#pin').value.trim(),
        lider: S.usuario.nome,
        cargoLider: $('#cargo').value.trim()
      };
      S.membros = [{ nome: S.usuario.nome, cargo: $('#cargo').value.trim(), lider: true }];
      salvar();
      aviso('Conta família criada.');
      irPara('index.html');
    };
  };

  /* ---- entrar conta família ---- */
  paginas['entrar-conta-familia'] = function () {
    $('#email').value = S.usuario.email || '';
    $('#btn-entrar').onclick = function () {
      var ok = validar([
        { sel: '#email', teste: function (v) { return /.+@.+\..+/.test(v); }, msg: 'Informe um e-mail válido.' },
        { sel: '#pin', msg: 'Informe o PIN da conta.' },
        { sel: '#cargo', msg: 'Informe seu cargo.' }
      ]);
      if (!ok) return;
      if (S.conta.criada && $('#pin').value.trim() !== S.conta.pin) {
        $('#pin').closest('.campo').classList.add('erro');
        $('.aviso-campo', $('#pin').closest('.campo')).textContent = 'PIN incorreto. O PIN de teste é ' + S.conta.pin + '.';
        return;
      }
      S.conta.criada = true;
      salvar();
      aviso('Você entrou na conta.');
      irPara('index.html');
    };
  };

  /* ---- início (responsável) ---- */
  paginas.inicio = function () {
    var c = crianca();
    $('#nome-usuario').textContent = S.usuario.nome;
    $('#filho-nome').innerHTML = esc(c.nome) + ', <span style="font-weight:400">' + c.idade + ' anos</span>';
    $('#saldo').innerHTML = num(c.saldo) + ' <span class="m" data-ic="moeda" data-tam="14"></span>';

    var hojeGanho = S.lancamentos
      .filter(function (l) { return l.crianca === c.id && l.valor > 0 && mesmoDia(l.quando, Date.now()); })
      .reduce(function (a, l) { return a + l.valor; }, 0);
    $('#hoje').textContent = (hojeGanho > 0 ? '+' : '') + num(hojeGanho) + ' hoje';

    var mapa = {
      refazer:   { cor: 'vermelho', ic: 'x',       rot: 'Refazer' },
      verificar: { cor: 'amarelo',  ic: 'alerta',  rot: 'Verificar' },
      concluido: { cor: 'verde',    ic: 'check',   rot: 'Concluído' },
      pendente:  { cor: 'azul',     ic: 'relogio', rot: 'Pendente' }
    };

    var lista = S.tarefas.filter(function (t) { return t.para.indexOf(c.id) >= 0; });
    var alvoEl = $('#lista-tarefas');
    if (!lista.length) {
      alvoEl.innerHTML = '<div class="vazio-lista">Nenhuma atividade para ' + esc(c.nome) + ' ainda. Crie a primeira acima.</div>';
    } else {
      alvoEl.innerHTML = lista.map(function (t) {
        var m = mapa[t.status] || mapa.pendente;
        return '<a class="item" href="tarefa-completa.html?id=' + t.id + '">' +
          '<span class="icone ' + m.cor + '" data-ic="' + m.ic + '" data-tam="16"></span>' +
          '<span class="item-info"><span class="nome">' + esc(t.nome) + '</span>' +
          '<span class="valor">' + num(t.ganhar) + ' moedas · ' + esc(t.horario || 'sem horário') + '</span></span>' +
          '<span class="status ' + t.status + '">' + m.rot + '</span></a>';
      }).join('');
    }

    $('#btn-trocar').onclick = function () {
      var i = S.criancas.indexOf(c);
      S.criancaAtual = S.criancas[(i + 1) % S.criancas.length].id;
      salvar();
      location.reload();
    };
    $('#sino').onclick = function () {
      var pend = S.tarefas.filter(function (t) { return t.status === 'verificar'; }).length;
      aviso(pend ? pend + ' atividade(s) esperando sua verificação.' : 'Nenhuma notificação nova.');
    };
    pintarIcones(alvoEl);
    pintarIcones($('#saldo'));
  };

  /* ---- criar atividade ---- */
  paginas['criar-atividade'] = function () {
    var selecionadas = [S.criancaAtual];
    var chips = $('#chips');
    function pintarChips() {
      chips.innerHTML = S.criancas.map(function (c) {
        var on = selecionadas.indexOf(c.id) >= 0;
        return '<button type="button" class="chip' + (on ? ' marcado' : '') + '" data-id="' + c.id + '">' +
          esc(c.nome) + (on ? '<span class="x" data-ic="x" data-tam="11"></span>' : '') + '</button>';
      }).join('');
      pintarIcones(chips);
      $$('.chip', chips).forEach(function (b) {
        b.onclick = function () {
          var cid = b.getAttribute('data-id');
          var i = selecionadas.indexOf(cid);
          if (i >= 0) selecionadas.splice(i, 1); else selecionadas.push(cid);
          pintarChips();
        };
      });
    }
    pintarChips();

    $('#btn-criar').onclick = function () {
      var ok = validar([{ sel: '#nome', msg: 'Dê um nome para a atividade.' }]);
      if (!selecionadas.length) { aviso('Escolha pelo menos uma criança.'); ok = false; }
      if (!ok) return;
      S.tarefas.unshift({
        id: id(),
        nome: $('#nome').value.trim(),
        descricao: $('#descricao').value.trim(),
        para: selecionadas.slice(),
        horario: $('#horario').value || '',
        ganhar: +$('#ganhar').value || 0,
        perder: +$('#perder').value || 0,
        atraso: +$('#atraso').value || 0,
        xp: +$('#xp').value || 0,
        status: 'pendente',
        autor: S.usuario.nome,
        quando: Date.now()
      });
      salvar();
      aviso('Atividade criada.');
      irPara('index.html');
    };
  };

  /* ---- tarefa completa ---- */
  paginas.tarefa = function () {
    var t = S.tarefas.filter(function (x) { return x.id === param('id'); })[0] || S.tarefas[0];
    if (!t) { $('#conteudo').innerHTML = '<div class="vazio-lista">Atividade não encontrada.</div>'; return; }

    $('#nome').value = t.nome;
    $('#descricao').value = t.descricao || '';
    $('#horario').value = t.horario || '';
    $('#ganhar').value = t.ganhar;
    $('#perder').value = t.perder;
    $('#atraso').value = t.atraso;
    $('#xp').value = t.xp;
    $('#autor').textContent = 'Criada por ' + esc(t.autor);

    var chips = $('#chips');
    chips.innerHTML = S.criancas.map(function (c) {
      var on = t.para.indexOf(c.id) >= 0;
      return '<button type="button" class="chip' + (on ? ' marcado' : '') + '" data-id="' + c.id + '">' +
        esc(c.nome) + (on ? '<span class="x" data-ic="check" data-tam="11"></span>' : '') + '</button>';
    }).join('');
    pintarIcones(chips);
    $$('.chip', chips).forEach(function (b) {
      b.onclick = function () {
        var cid = b.getAttribute('data-id');
        var i = t.para.indexOf(cid);
        if (i >= 0) t.para.splice(i, 1); else t.para.push(cid);
        salvar();
        paginas.tarefa();
      };
    });

    var rot = { pendente: 'Pendente', verificar: 'Aguardando verificação', concluido: 'Concluída', refazer: 'Precisa refazer' };
    $('#situacao').textContent = rot[t.status];

    function guardar() {
      t.nome = $('#nome').value.trim() || t.nome;
      t.descricao = $('#descricao').value.trim();
      t.horario = $('#horario').value;
      t.ganhar = +$('#ganhar').value || 0;
      t.perder = +$('#perder').value || 0;
      t.atraso = +$('#atraso').value || 0;
      t.xp = +$('#xp').value || 0;
      salvar();
    }

    $('#btn-salvar').onclick = function () { guardar(); aviso('Alterações salvas.'); };

    $('#btn-aprovar').onclick = function () {
      guardar();
      t.status = 'concluido';
      t.para.forEach(function (cid) { lancar(cid, t.nome, t.ganhar); });
      salvar();
      aviso('Aprovada. ' + num(t.ganhar) + ' moedas creditadas.');
      irPara('index.html');
    };

    $('#btn-refazer').onclick = function () {
      guardar();
      t.status = 'refazer';
      salvar();
      aviso('Enviada para refazer.');
      irPara('index.html');
    };

    $('#btn-deletar').onclick = function () {
      S.tarefas = S.tarefas.filter(function (x) { return x.id !== t.id; });
      salvar();
      aviso('Atividade apagada.');
      irPara('index.html');
    };
  };

  /* ---- responsáveis ---- */
  paginas.responsaveis = function () {
    var alvoEl = $('#lista-responsaveis');
    alvoEl.innerHTML = S.membros.map(function (m, i) {
      return '<div class="cartao-pessoa">' +
        '<span class="icone azul" data-ic="usuario" data-tam="18"></span>' +
        '<span class="dados">' + esc(m.nome) + (m.lider ? ' · líder' : '') + '<span>' + esc(m.cargo) + '</span></span>' +
        '<button class="acao" type="button" data-i="' + i + '" data-ic="mensagem" data-tam="22"></button>' +
        '</div>';
    }).join('');
    pintarIcones(alvoEl);
    $$('.acao', alvoEl).forEach(function (b) {
      b.onclick = function () { aviso('Conversa aberta com ' + S.membros[+b.getAttribute('data-i')].nome + '.'); };
    });
  };

  /* ---- histórico ---- */
  paginas.historico = function () {
    var sel = $('#seletor');
    sel.innerHTML = S.criancas.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === S.criancaAtual ? ' selected' : '') + '>' + esc(c.nome) + '</option>';
    }).join('');
    sel.onchange = function () { S.criancaAtual = sel.value; salvar(); paginas.historico(); };

    var c = crianca();
    $('#total').textContent = num(c.saldo);

    var doDia = S.lancamentos.filter(function (l) { return l.crianca === c.id && mesmoDia(l.quando, Date.now()); });
    var g = doDia.filter(function (l) { return l.valor > 0; }).reduce(function (a, l) { return a + l.valor; }, 0);
    var p = doDia.filter(function (l) { return l.valor < 0; }).reduce(function (a, l) { return a + l.valor; }, 0);
    $('#ganhos').textContent = '+ ' + num(g);
    $('#perdas').textContent = '− ' + num(Math.abs(p));

    var filtro = 'todos';
    function desenhar() {
      var itens = S.lancamentos
        .filter(function (l) { return l.crianca === c.id; })
        .filter(function (l) { return filtro === 'todos' || (filtro === 'ganhos' ? l.valor > 0 : l.valor < 0); })
        .sort(function (a, b) { return b.quando - a.quando; });

      var alvoEl = $('#extrato');
      if (!itens.length) {
        alvoEl.innerHTML = '<div class="vazio-lista">Nenhum lançamento neste filtro.</div>';
        return;
      }
      var html = '', diaAtual = null;
      itens.forEach(function (l) {
        var d = rotuloDia(l.quando);
        if (d !== diaAtual) {
          diaAtual = d;
          html += '</div><div class="dia-titulo">' + d + '</div><div class="extrato">';
        }
        var sobe = l.valor > 0;
        html += '<div class="lancamento">' +
          '<span class="seta ' + (sobe ? 'sobe' : 'desce') + '" data-ic="' + (sobe ? 'seta-cima' : 'seta-baixo') + '" data-tam="16"></span>' +
          '<span class="nome">' + esc(l.nome) + '<small>' + hora(l.quando) + '</small></span>' +
          '<span class="valor numero ' + (sobe ? 'ganho' : 'perda') + '">' + (sobe ? '+' : '−') + num(Math.abs(l.valor)) + '</span>' +
          '</div>';
      });
      alvoEl.innerHTML = html.replace(/^<\/div>/, '');
      pintarIcones(alvoEl);
    }
    desenhar();

    $$('.filtro').forEach(function (b) {
      b.onclick = function () {
        $$('.filtro').forEach(function (x) { x.classList.remove('ativo'); });
        b.classList.add('ativo');
        filtro = b.getAttribute('data-filtro');
        desenhar();
      };
    });
  };

  /* ---- alterar moedas ---- */
  paginas['alterar-moedas'] = function () {
    var c = crianca();
    $('#quem').textContent = c.nome + ' · saldo ' + num(c.saldo);

    function aplicar(sinal) {
      var v = Math.abs(parseInt($('#valor').value, 10) || 0);
      if (!v) { validar([{ sel: '#valor', teste: function () { return false; }, msg: 'Informe um valor maior que zero.' }]); return; }
      var motivo = $('#motivo').value.trim() || (sinal > 0 ? 'Ajuste manual' : 'Desconto manual');
      lancar(c.id, motivo, sinal * v);
      salvar();
      aviso((sinal > 0 ? '+' : '−') + num(v) + ' moedas para ' + c.nome + '.');
      irPara('historico.html');
    }
    $('#btn-add').onclick = function () { aplicar(1); };
    $('#btn-rem').onclick = function () { aplicar(-1); };
  };

  /* ---- recompensas ---- */
  paginas.recompensa = function () {
    var c = crianca();
    $('#filho-texto').innerHTML = esc(c.nome) + ',<br>' + c.idade + ' anos';
    $('#sequencia').textContent = c.sequencia;

    var alvo = S.metas.filter(function (m) { return m.id === S.alvo; })[0] || S.metas[0];
    if (alvo) {
      var pct = Math.min(100, Math.round((c.saldo / alvo.preco) * 100));
      $('#alvo-nome').textContent = alvo.nome;
      $('#alvo-atual').textContent = num(c.saldo);
      $('#alvo-total').textContent = 'de ' + num(alvo.preco);
      $('#alvo-barra').style.width = pct + '%';
      var falta = alvo.preco - c.saldo;
      var f = $('#alvo-falta');
      f.textContent = falta > 0 ? 'Faltam ' + num(falta) + ' moedas' : 'Meta alcançada! Já dá para resgatar.';
      f.classList.toggle('ok', falta <= 0);
    }

    var alvoEl = $('#lista-metas');
    alvoEl.innerHTML = S.metas.map(function (m) {
      return '<div class="meta' + (m.id === S.alvo ? ' alvo-atual' : '') + '">' +
        '<span class="presente" data-ic="presente" data-tam="22"></span>' +
        '<div class="nome">' + esc(m.nome) + '</div>' +
        '<div class="preco">' + num(m.preco) + '</div>' +
        '<div class="acoes">' +
        '<button class="carrinho" type="button" title="Resgatar" data-comprar="' + m.id + '" data-ic="carrinho" data-tam="14"></button>' +
        '<button class="alvo" type="button" title="Definir como meta" data-alvo="' + m.id + '" data-ic="alvo" data-tam="14"></button>' +
        '</div></div>';
    }).join('');
    pintarIcones(alvoEl);

    $$('[data-alvo]', alvoEl).forEach(function (b) {
      b.onclick = function () { S.alvo = b.getAttribute('data-alvo'); salvar(); paginas.recompensa(); aviso('Nova meta definida.'); };
    });
    $$('[data-comprar]', alvoEl).forEach(function (b) {
      b.onclick = function () {
        var m = S.metas.filter(function (x) { return x.id === b.getAttribute('data-comprar'); })[0];
        if (c.saldo < m.preco) { aviso('Faltam ' + num(m.preco - c.saldo) + ' moedas para resgatar.'); return; }
        lancar(c.id, 'Resgate: ' + m.nome, -m.preco);
        salvar();
        paginas.recompensa();
        aviso(m.nome + ' resgatado.');
      };
    });

    var form = $('#form-meta');
    $('#btn-nova').onclick = function () { form.classList.toggle('aberto'); if (form.classList.contains('aberto')) $('#meta-nome').focus(); };
    $('#btn-salvar-meta').onclick = function () {
      var ok = validar([
        { sel: '#meta-nome', msg: 'Dê um nome para a recompensa.' },
        { sel: '#meta-preco', teste: function (v) { return +v > 0; }, msg: 'Informe quantas moedas custa.' }
      ]);
      if (!ok) return;
      S.metas.push({ id: id(), nome: $('#meta-nome').value.trim(), preco: +$('#meta-preco').value });
      salvar();
      $('#meta-nome').value = ''; $('#meta-preco').value = '';
      form.classList.remove('aberto');
      paginas.recompensa();
      aviso('Recompensa adicionada.');
    };
  };

  /* ---- dashboard do filho ---- */
  paginas.filho = function () {
    var c = crianca();
    $('#titulo-filho').textContent = c.nome;
    $('#saldo-filho').innerHTML = num(c.saldo) + ' moedas';

    var alvo = S.metas.filter(function (m) { return m.id === S.alvo; })[0] || S.metas[0];
    if (alvo) {
      $('#rec-nome').textContent = alvo.nome;
      $('#rec-valor').textContent = num(alvo.preco);
      $('#rec-progresso').textContent = num(c.saldo) + ' / ' + num(alvo.preco);
      $('#rec-barra').style.width = Math.min(100, Math.round(c.saldo / alvo.preco * 100)) + '%';
    }

    var minhas = S.tarefas.filter(function (t) { return t.para.indexOf(c.id) >= 0 && t.status !== 'concluido'; });
    var alvoEl = $('#tarefas-filho');
    if (!minhas.length) {
      alvoEl.innerHTML = '<div class="vazio-lista">Tudo em dia. Nenhuma tarefa aberta.</div>';
    } else {
      var etq = { pendente: ['Pendente', ''], verificar: ['Enviada', 'ok'], refazer: ['Refazer', 'ruim'] };
      alvoEl.innerHTML = minhas.map(function (t) {
        var e = etq[t.status] || etq.pendente;
        return '<div class="cartao-tarefa">' +
          '<div class="autor">Missão criada por ' + esc(t.autor) + '</div>' +
          '<div class="nome">' + esc(t.nome) + '</div>' +
          '<div class="status-linha"><span>Status:</span>' +
          '<span class="etiqueta ' + e[1] + '">' + e[0] + '</span>' +
          '<a class="ver-mais" href="tarefa-completa.html?id=' + t.id + '">Ver mais</a></div>' +
          '<div class="botoes">' +
          '<button type="button" class="secundario" data-foto="' + t.id + '"><span data-ic="camera" data-tam="13"></span>Mandar foto</button>' +
          '<button type="button" data-enviar="' + t.id + '"><span data-ic="enviar" data-tam="13"></span>Enviar</button>' +
          '</div></div>';
      }).join('');
      pintarIcones(alvoEl);
      $$('[data-foto]', alvoEl).forEach(function (b) {
        b.onclick = function () { aviso('Foto anexada à tarefa.'); };
      });
      $$('[data-enviar]', alvoEl).forEach(function (b) {
        b.onclick = function () {
          var t = S.tarefas.filter(function (x) { return x.id === b.getAttribute('data-enviar'); })[0];
          t.status = 'verificar';
          salvar();
          paginas.filho();
          aviso('Enviada para verificação.');
        };
      });
    }

    var evEl = $('#eventos');
    var proximas = S.tarefas.filter(function (t) { return t.para.indexOf(c.id) >= 0; }).slice(0, 3);
    evEl.innerHTML = proximas.map(function (t, i) {
      var d = new Date(Date.now() + i * DIA);
      return '<div class="evento"><div class="dia">' + String(d.getDate()).padStart(2, '0') + '</div>' +
        '<div class="mes">' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear() + '</div>' +
        '<div class="info">' + esc(t.horario || '—') + '</div></div>';
    }).join('') || '<div class="vazio-lista">Sem eventos.</div>';
  };

  /* ---- perfil ---- */
  paginas.perfil = function () {
    $('#dados').innerHTML = 'Nome: ' + esc(S.usuario.nome) + '<br>E-mail: ' + esc(S.usuario.email);
    $('#nome').value = S.usuario.nome;
    $('#email').value = S.usuario.email;

    $('#btn-salvar').onclick = function () {
      var ok = validar([
        { sel: '#nome', msg: 'Informe seu nome.' },
        { sel: '#email', teste: function (v) { return /.+@.+\..+/.test(v); }, msg: 'Informe um e-mail válido.' }
      ]);
      if (!ok) return;
      S.usuario.nome = $('#nome').value.trim();
      S.usuario.email = $('#email').value.trim();
      if ($('#senha').value.trim()) S.usuario.senha = $('#senha').value.trim();
      salvar();
      $('#dados').innerHTML = 'Nome: ' + esc(S.usuario.nome) + '<br>E-mail: ' + esc(S.usuario.email);
      aviso('Perfil atualizado.');
    };

    $('#cfg-tema').onclick = alternarTema;
    $('#cfg-dispositivo').onclick = alternarDispositivo;
    $('#cfg-zerar').onclick = function () { aviso('Dados de teste reiniciados.'); setTimeout(zerar, 700); };
    $('#cfg-sair').onclick = function () { S.logado = false; salvar(); irPara('login.html'); };
  };

  /* ---- conta família ---- */
  paginas['conta-familia'] = function () {
    $('#titulo-conta').textContent = S.conta.nome;
    $('#lider').textContent = S.conta.lider + ' (' + S.conta.cargoLider + ')';
    $('#conta-nome').textContent = S.conta.nome;

    var visivel = false;
    function pin() { $('#pin-valor').textContent = visivel ? S.conta.pin : S.conta.pin.replace(/./g, '•'); }
    pin();
    $('#btn-pin').onclick = function () {
      visivel = !visivel;
      pin();
      $('#btn-pin').innerHTML = icone(visivel ? 'olho-corte' : 'olho', 16);
    };

    function listar() {
      var alvoEl = $('#membros');
      alvoEl.innerHTML = S.membros.map(function (m, i) {
        return '<div class="membro"><span>' + esc(m.nome) + ' (' + esc(m.cargo) + ')' + (m.lider ? ' · líder' : '') + '</span>' +
          (m.lider ? '' : '<button class="remover" type="button" data-i="' + i + '" data-ic="menos" data-tam="14"></button>') +
          '</div>';
      }).join('');
      pintarIcones(alvoEl);
      $$('.remover', alvoEl).forEach(function (b) {
        b.onclick = function () {
          var i = +b.getAttribute('data-i');
          aviso(S.membros[i].nome + ' removido da conta.');
          S.membros.splice(i, 1);
          salvar();
          listar();
        };
      });
    }
    listar();

    $('#btn-sair').onclick = function () {
      S.conta.criada = false;
      salvar();
      aviso('Você saiu da conta família.');
      irPara('dashboard-inicial.html');
    };
  };

  /* ---------------------------------------------------------
     6.9 Barra lateral (modo tablet)
     --------------------------------------------------------- */

  var MENU_LATERAL = [
    { nome: 'Início',     ic: 'casa',    url: 'index.html' },
    { nome: 'Histórico',  ic: 'relogio', url: 'historico.html' },
    { nome: 'Recompensa', ic: 'moedas',  url: 'recompensa.html' },
    { nome: 'Perfil',     ic: 'ajustes', url: 'perfil.html' }
  ];

  var PAGINAS_ENTRADA = ['login', 'cadastro', 'criar-conta-familia', 'entrar-conta-familia'];

  var ATIVO_LATERAL = {
    inicio: 'index.html',
    'criar-atividade': 'index.html',
    tarefa: 'index.html',
    responsaveis: 'index.html',
    historico: 'historico.html',
    'alterar-moedas': 'historico.html',
    recompensa: 'recompensa.html',
    perfil: 'perfil.html',
    'conta-familia': 'perfil.html'
  };

  function montarLateral() {
    var pag = document.body.getAttribute('data-pagina');
    if (PAGINAS_ENTRADA.indexOf(pag) >= 0) return;

    var moldura = $('.celular');
    if (!moldura) return;

    var itens = MENU_LATERAL.slice();
    var atual = ATIVO_LATERAL[pag] || '';

    if (pag === 'dashboard-inicial') {
      itens = [
        { nome: 'Início', ic: 'casa', url: 'dashboard-inicial.html' },
        { nome: 'Perfil', ic: 'ajustes', url: 'perfil.html' }
      ];
      atual = 'dashboard-inicial.html';
    }
    if (pag === 'filho') {
      itens[0] = { nome: 'Início', ic: 'casa', url: 'dashboard-filho.html' };
      atual = 'dashboard-filho.html';
    }

    var lateral = document.createElement('aside');
    lateral.className = 'barra-lateral';
    lateral.innerHTML =
      '<div class="lateral-topo">' +
        '<div class="foto" data-ic="usuario" data-tam="30"></div>' +
        '<div class="lateral-nome">' + esc(S.usuario.nome || '—') + '</div>' +
        '<div class="lateral-email">' + esc(S.usuario.email || '') + '</div>' +
      '</div>' +
      '<nav class="lateral-menu">' +
        itens.map(function (i) {
          return '<a class="lateral-item' + (i.url === atual ? ' ativo' : '') + '" href="' + i.url + '">' +
            '<span data-ic="' + i.ic + '" data-tam="19"></span>' + i.nome + '</a>';
        }).join('') +
      '</nav>' +
      '<button class="lateral-sair" type="button">Sair da conta</button>';

    moldura.insertBefore(lateral, moldura.firstChild);
    lateral.querySelector('.lateral-sair').onclick = function () {
      S.logado = false;
      salvar();
      aviso('Você saiu da conta.');
      irPara('login.html');
    };
    pintarIcones(lateral);
  }

  /* telas de entrada viram um cartão centralizado no tablet */
  function montarPainel() {
    var pag = document.body.getAttribute('data-pagina');
    if (PAGINAS_ENTRADA.indexOf(pag) < 0) return;
    var tela = $('.tela');
    if (!tela || tela.querySelector('.painel')) return;
    var painel = document.createElement('div');
    painel.className = 'painel';
    while (tela.firstChild) painel.appendChild(tela.firstChild);
    tela.appendChild(painel);
  }

  /* ---------------------------------------------------------
     7. Inicialização
     --------------------------------------------------------- */

  function iniciar() {
    montarControles();
    aplicarTema();
    aplicarDispositivo();
    montarLateral();
    montarPainel();
    pintarIcones();

    var p = document.body.getAttribute('data-pagina');
    if (paginas[p]) {
      try { paginas[p](); } catch (e) { console.error('Erro na página ' + p, e); }
    }
    pintarIcones();

    // limpa o estado de erro assim que a pessoa corrige o campo
    document.addEventListener('input', function (ev) {
      var caixa = ev.target.closest && ev.target.closest('.campo.erro');
      if (caixa) caixa.classList.remove('erro');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  window.App = { estado: function () { return S; }, salvar: salvar, zerar: zerar, icone: icone, aviso: aviso };
})();