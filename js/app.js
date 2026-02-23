/* ========== INÍCIO: app.js | path: pataalerta/js/app.js ========== */

/**
 * PataAlerta — App Principal
 * Router hash, inicialização geral, controle de telas
 * Este é o ponto de entrada que orquestra todos os módulos
 */

/* ---------- ESTADO DA APP ---------- */

var appIniciado = false;
var telaAtual = null;

/* ---------- MAPA DE TELAS ---------- */

var telas = {
  home: 'screenHome',
  alertas: 'screenAlertas',
  detalhe: 'screenDetalhe',
  novo: 'screenNovo',
  confirmacao: 'screenConfirmacao',
  admin: 'screenAdmin'
};

/* ---------- ROUTER ---------- */

/**
 * Processa a rota atual baseada no hash da URL
 */
function processarRota() {
  try {
    var hash = window.location.hash || '#/';
    var partes = hash.replace('#/', '').split('/');
    var rota = partes[0] || '';
    var param = partes[1] || '';

    // Fechar menu mobile se aberto
    var menu = document.getElementById('mobileMenu');
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      var toggle = document.getElementById('menuToggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    // Roteamento
    switch (rota) {
      case '':
      case 'home':
        mostrarTela('home');
        atualizarNavAtivo('home');
        carregarAlertasHome();
        carregarContadoresHome();
        break;

      case 'alertas':
        mostrarTela('alertas');
        atualizarNavAtivo('alertas');
        resetarFiltros();
        atualizarChipsVisuais();
        carregarListaAlertas(false);
        break;

      case 'alerta':
        if (param) {
          mostrarTela('detalhe');
          atualizarNavAtivo('');
          carregarTelaDetalhe(param);
        } else {
          navegarPara('alertas');
        }
        break;

      case 'novo':
        mostrarTela('novo');
        atualizarNavAtivo('');
        resetarFormulario();
        break;

      case 'confirmacao':
        if (window.ultimoAlertaCriado) {
          mostrarTela('confirmacao');
          atualizarNavAtivo('');
        } else {
          navegarPara('home');
        }
        break;

      case 'admin':
        mostrarTela('admin');
        atualizarNavAtivo('');
        carregarTelaAdmin();
        break;

      default:
        navegarPara('home');
        break;
    }

    // Scroll para topo
    scrollParaTopo();
  } catch (error) {
    console.error('Erro ao processar rota:', error);
    navegarPara('home');
  }
}

/**
 * Mostra uma tela e esconde todas as outras
 * @param {string} nomeTela — Nome da tela (home, alertas, detalhe, etc.)
 */
function mostrarTela(nomeTela) {
  try {
    // Esconder todas
    Object.keys(telas).forEach(function (key) {
      var el = document.getElementById(telas[key]);
      if (el) {
        el.style.display = 'none';
      }
    });

    // Mostrar a tela solicitada
    var telaId = telas[nomeTela];
    if (telaId) {
      var el = document.getElementById(telaId);
      if (el) {
        el.style.display = 'block';
        telaAtual = nomeTela;
      }
    }
  } catch (error) {
    console.error('Erro ao mostrar tela:', error);
  }
}

/**
 * Navega para uma rota
 * @param {string} rota — Rota sem # (ex: 'alertas', 'novo')
 */
function navegarPara(rota) {
  window.location.hash = '#/' + rota;
}

/* ---------- ATUALIZAR CHIPS VISUAIS ---------- */

/**
 * Reseta visualmente os chips de filtro para "Todos"
 */
function atualizarChipsVisuais() {
  try {
    // Resetar chips de tipo
    var chipsTipo = document.querySelectorAll('#filterTipo .chip');
    chipsTipo.forEach(function (chip) {
      chip.classList.remove('chip--active');
      if (chip.getAttribute('data-value') === 'todos') {
        chip.classList.add('chip--active');
      }
    });

    // Resetar chips de espécie
    var chipsEspecie = document.querySelectorAll('#filterEspecie .chip');
    chipsEspecie.forEach(function (chip) {
      chip.classList.remove('chip--active');
      if (chip.getAttribute('data-value') === 'todos') {
        chip.classList.add('chip--active');
      }
    });

    // Resetar select de bairro
    var selectBairro = document.getElementById('filterBairro');
    if (selectBairro) {
      selectBairro.value = 'todos';
    }
  } catch (error) {
    // Silencioso
  }
}

/* ---------- INICIALIZAÇÃO GERAL ---------- */

/**
 * Inicializa toda a aplicação
 */
function inicializarApp() {
  if (appIniciado) return;

  try {
    console.log('🐾 PataAlerta v0.1.0 — Iniciando...');

    // 1. Inicializar Firebase
    initFirebase();

    // 2. Verificar se Firebase está pronto
    if (!isFirebaseReady()) {
      console.warn('⚠️ Firebase não configurado. O app funcionará em modo limitado.');
    }

    // 3. Carregar configuração (bairros, espécies, cidades)
    carregarConfig()
      .then(function (config) {
        if (config) {
          popularSelectBairros(config.bairros || []);
          popularSelectCidades(config.cidades || []);
          console.log('✅ Config carregada');
        }
      })
      .catch(function (error) {
        console.error('Erro ao carregar config:', error);
        // Usar config padrão
        var configPadrao = getConfigPadrao();
        popularSelectBairros(configPadrao.bairros);
      });

    // 4. Inicializar componentes UI
    inicializarMenuMobile();
    inicializarFiltros();
    inicializarBotaoCarregarMais();
    inicializarFormulario();
    inicializarConfirmacao();
    inicializarModalDenuncia();
    inicializarAdmin();
    definirAnoFooter();

    // 5. Renderizar ícones Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // 6. Configurar router
    window.addEventListener('hashchange', processarRota);

    // 7. Processar rota inicial
    processarRota();

    appIniciado = true;
    console.log('✅ PataAlerta iniciado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar PataAlerta:', error);
  }
}

/* ---------- PONTO DE ENTRADA ---------- */

/**
 * Aguarda DOM e scripts carregarem, então inicializa
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    // Pequeno delay para garantir que todos os scripts defer carregaram
    setTimeout(inicializarApp, 50);
  });
} else {
  setTimeout(inicializarApp, 50);
}

/* ========== FIM: app.js | path: pataalerta/js/app.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. processarRota() — Processa hash e exibe tela correspondente
  2. mostrarTela(nomeTela) — Mostra uma tela e esconde as demais
  3. navegarPara(rota) — Navega para uma rota
  4. atualizarChipsVisuais() — Reseta chips de filtro visualmente
  5. inicializarApp() — Inicializa toda a aplicação
  + Ponto de entrada (DOMContentLoaded)
*/
