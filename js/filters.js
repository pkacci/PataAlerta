/* ========== INÍCIO: filters.js | path: pataalerta/js/filters.js ========== */

/**
 * PataAlerta — Filtros e Paginação
 * Gerencia estado dos filtros, paginação e recarregamento da lista
 */

/* ---------- ESTADO DOS FILTROS ---------- */

var estadoFiltros = {
  tipo: 'todos',
  especie: 'todos',
  bairro: 'todos',
  ultimoDoc: null,
  carregando: false,
  temMais: false
};

/**
 * Reseta os filtros para o estado inicial
 */
function resetarFiltros() {
  estadoFiltros.tipo = 'todos';
  estadoFiltros.especie = 'todos';
  estadoFiltros.bairro = 'todos';
  estadoFiltros.ultimoDoc = null;
  estadoFiltros.carregando = false;
  estadoFiltros.temMais = false;
}

/**
 * Retorna os filtros ativos (apenas os que não são "todos")
 * @returns {object} Filtros ativos para a query
 */
function obterFiltrosAtivos() {
  var filtros = {};

  if (estadoFiltros.tipo !== 'todos') {
    filtros.tipo = estadoFiltros.tipo;
  }

  if (estadoFiltros.especie !== 'todos') {
    filtros.especie = estadoFiltros.especie;
  }

  if (estadoFiltros.bairro !== 'todos') {
    filtros.bairro = estadoFiltros.bairro;
  }

  return filtros;
}

/* ---------- INICIALIZAÇÃO DOS FILTROS ---------- */

/**
 * Inicializa os listeners dos filtros (chips e select)
 */
function inicializarFiltros() {
  try {
    // Chips de tipo
    inicializarChips('filterTipo', 'tipo');

    // Chips de espécie
    inicializarChips('filterEspecie', 'especie');

    // Select de bairro
    var selectBairro = document.getElementById('filterBairro');
    if (selectBairro) {
      selectBairro.addEventListener('change', function () {
        estadoFiltros.bairro = selectBairro.value;
        estadoFiltros.ultimoDoc = null;
        recarregarLista();
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar filtros:', error);
  }
}

/**
 * Inicializa listeners para um grupo de chips
 * @param {string} containerId — ID do container dos chips
 * @param {string} filtroNome — Nome do filtro ('tipo' ou 'especie')
 */
function inicializarChips(containerId, filtroNome) {
  try {
    var container = document.getElementById(containerId);
    if (!container) return;

    var chips = container.querySelectorAll('.chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        // Remover active de todos
        chips.forEach(function (c) {
          c.classList.remove('chip--active');
        });

        // Ativar o clicado
        chip.classList.add('chip--active');

        // Atualizar estado
        estadoFiltros[filtroNome] = chip.getAttribute('data-value');
        estadoFiltros.ultimoDoc = null;

        // Recarregar com debounce
        recarregarListaDebounced();
      });
    });
  } catch (error) {
    console.error('Erro ao inicializar chips:', error);
  }
}

/* ---------- POPULAR SELECT DE BAIRROS ---------- */

/**
 * Popula o select de bairros com dados da config
 * @param {string[]} bairros — Lista de bairros
 */
function popularSelectBairros(bairros) {
  try {
    // Select do filtro
    var selectFiltro = document.getElementById('filterBairro');
    if (selectFiltro) {
      // Manter opção "Todos"
      selectFiltro.innerHTML = '<option value="todos">Todos os bairros</option>';
      bairros.forEach(function (bairro) {
        var option = document.createElement('option');
        option.value = bairro;
        option.textContent = bairro;
        selectFiltro.appendChild(option);
      });
    }

    // Select do formulário
    var selectForm = document.getElementById('inputBairro');
    if (selectForm) {
      selectForm.innerHTML = '<option value="">Selecione o bairro</option>';
      bairros.forEach(function (bairro) {
        var option = document.createElement('option');
        option.value = bairro;
        option.textContent = bairro;
        selectForm.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao popular bairros:', error);
  }
}

/**
 * Popula o select de cidades com dados da config
 * Trata tanto string quanto array
 * @param {string|string[]} cidades — Cidade(s) da config
 */
function popularSelectCidades(cidades) {
  try {
    var selectForm = document.getElementById('inputCidade');
    if (!selectForm) return;

    // Converter para array se for string
    var listaCidades = [];
    if (typeof cidades === 'string') {
      listaCidades = [cidades];
    } else if (Array.isArray(cidades)) {
      listaCidades = cidades;
    }

    // Se não tem cidades, manter como input livre
    if (listaCidades.length === 0) return;

    // Transformar input em select
    var parent = selectForm.parentNode;
    var label = parent.querySelector('.form__label');
    var error = parent.querySelector('.form__error');

    var novoSelect = document.createElement('select');
    novoSelect.className = 'select';
    novoSelect.id = 'inputCidade';
    novoSelect.required = true;

    var optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = 'Selecione a cidade';
    novoSelect.appendChild(optionDefault);

    listaCidades.forEach(function (cidade) {
      var option = document.createElement('option');
      option.value = cidade;
      option.textContent = cidade;
      novoSelect.appendChild(option);
    });

    // Adicionar opção "Outra"
    var optionOutra = document.createElement('option');
    optionOutra.value = 'Outra';
    optionOutra.textContent = 'Outra';
    novoSelect.appendChild(optionOutra);

    parent.replaceChild(novoSelect, selectForm);
  } catch (error) {
    console.error('Erro ao popular cidades:', error);
  }
}

/* ---------- CARREGAR LISTA ---------- */

/**
 * Carrega a lista de alertas com filtros e paginação
 * @param {boolean} appendMode — Se true, adiciona ao final (carregar mais)
 */
function carregarListaAlertas(appendMode) {
  if (estadoFiltros.carregando) return;

  try {
    estadoFiltros.carregando = true;
    var container = document.getElementById('alertsList');
    var skeleton = document.getElementById('skeletonList');
    var emptyState = document.getElementById('emptyAlertas');
    var errorState = document.getElementById('errorAlertas');
    var loadMore = document.getElementById('loadMore');

    // Mostrar skeleton na primeira carga
    if (!appendMode && skeleton) {
      skeleton.style.display = 'grid';
      if (container) container.innerHTML = '';
    }

    // Esconder estados
    if (emptyState) emptyState.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    if (loadMore) loadMore.style.display = 'none';

    var filtros = obterFiltrosAtivos();
    var ultimoDoc = appendMode ? estadoFiltros.ultimoDoc : null;

    listarAlertas(filtros, 12, ultimoDoc)
      .then(function (resultado) {
        // Esconder skeleton
        if (skeleton) skeleton.style.display = 'none';

        estadoFiltros.ultimoDoc = resultado.ultimoDoc;
        estadoFiltros.temMais = resultado.temMais;
        estadoFiltros.carregando = false;

        if (!appendMode && resultado.alertas.length === 0) {
          // Empty state
          if (emptyState) emptyState.style.display = 'block';
          return;
        }

        // Renderizar cards
        if (container) {
          if (!appendMode) {
            container.innerHTML = '';
          }

          resultado.alertas.forEach(function (alerta) {
            var cardHTML = renderizarCard(alerta);
            container.insertAdjacentHTML('beforeend', cardHTML);
          });

          // Re-renderizar ícones Lucide nos novos cards
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }

          // Adicionar listeners nos cards
          adicionarListenersCards(container);
        }

        // Mostrar "Carregar mais" se houver
        if (loadMore && resultado.temMais) {
          loadMore.style.display = 'block';
        }
      })
      .catch(function (error) {
        console.error('Erro ao carregar lista:', error);
        if (skeleton) skeleton.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        estadoFiltros.carregando = false;
      });
  } catch (error) {
    console.error('Erro ao carregar lista:', error);
    estadoFiltros.carregando = false;
  }
}

/**
 * Recarrega a lista do zero (reseta paginação)
 */
function recarregarLista() {
  estadoFiltros.ultimoDoc = null;
  carregarListaAlertas(false);
}

/**
 * Recarrega com debounce de 300ms
 */
var recarregarListaDebounced = debounce(function () {
  recarregarLista();
}, 300);

/**
 * Carrega próxima página (append)
 */
function carregarMais() {
  if (estadoFiltros.temMais && !estadoFiltros.carregando) {
    carregarListaAlertas(true);
  }
}

/* ---------- CARREGAR ALERTAS RECENTES (HOME) ---------- */

/**
 * Carrega os alertas recentes na Home
 */
function carregarAlertasHome() {
  try {
    var container = document.getElementById('recentAlerts');
    var emptyState = document.getElementById('emptyHome');

    if (!container) return;

    listarAlertasRecentes()
      .then(function (alertas) {
        if (alertas.length === 0) {
          if (emptyState) emptyState.style.display = 'block';
          return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = '';
        alertas.forEach(function (alerta) {
          var cardHTML = renderizarCard(alerta);
          container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Re-renderizar ícones Lucide
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        // Adicionar listeners nos cards
        adicionarListenersCards(container);
      })
      .catch(function (error) {
        console.error('Erro ao carregar alertas home:', error);
      });
  } catch (error) {
    console.error('Erro ao carregar alertas home:', error);
  }
}

/**
 * Carrega os contadores na Home (alertas ativos e resolvidos)
 */
function carregarContadoresHome() {
  try {
    obterContadores()
      .then(function (contadores) {
        var elTotal = document.getElementById('statTotal');
        var elResolvidos = document.getElementById('statResolvidos');

        if (elTotal) {
          animarContador(elTotal, contadores.ativos);
        }
        if (elResolvidos) {
          animarContador(elResolvidos, contadores.resolvidos);
        }
      })
      .catch(function (error) {
        console.error('Erro ao carregar contadores:', error);
      });
  } catch (error) {
    console.error('Erro ao carregar contadores:', error);
  }
}

/**
 * Anima o contador com efeito count-up
 * @param {HTMLElement} elemento — Elemento do contador
 * @param {number} valorFinal — Valor final
 */
function animarContador(elemento, valorFinal) {
  try {
    if (!elemento || valorFinal === 0) {
      if (elemento) elemento.textContent = '0';
      return;
    }

    var duracao = 1000;
    var inicio = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progresso = Math.min((timestamp - startTime) / duracao, 1);

      // Easing: ease-out
      var eased = 1 - Math.pow(1 - progresso, 3);
      var valorAtual = Math.floor(eased * valorFinal);

      elemento.textContent = String(valorAtual);

      if (progresso < 1) {
        requestAnimationFrame(step);
      } else {
        elemento.textContent = String(valorFinal);
      }
    }

    requestAnimationFrame(step);
  } catch (error) {
    if (elemento) elemento.textContent = String(valorFinal);
  }
}

/* ---------- LISTENERS DOS CARDS ---------- */

/**
 * Adiciona listeners de clique nos cards para navegar ao detalhe
 * @param {HTMLElement} container — Container dos cards
 */
function adicionarListenersCards(container) {
  try {
    var cards = container.querySelectorAll('.card[data-id]');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        // Não navegar se clicou em link ou botão dentro do card
        if (e.target.closest('a') || e.target.closest('button')) return;

        var alertaId = card.getAttribute('data-id');
        if (alertaId) {
          window.location.hash = '#/alerta/' + alertaId;
        }
      });
    });
  } catch (error) {
    console.error('Erro ao adicionar listeners:', error);
  }
}

/* ---------- INICIALIZAR BOTÃO CARREGAR MAIS ---------- */

/**
 * Inicializa o botão "Carregar mais"
 */
function inicializarBotaoCarregarMais() {
  try {
    var btn = document.getElementById('btnLoadMore');
    if (btn) {
      btn.addEventListener('click', function () {
        carregarMais();
      });
    }

    // Botão retry
    var btnRetry = document.getElementById('btnRetryList');
    if (btnRetry) {
      btnRetry.addEventListener('click', function () {
        recarregarLista();
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar botões:', error);
  }
}

/* ========== FIM: filters.js | path: pataalerta/js/filters.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. resetarFiltros() — Reseta filtros para estado inicial
  2. obterFiltrosAtivos() — Retorna filtros ativos para query
  3. inicializarFiltros() — Inicializa listeners dos filtros
  4. inicializarChips(containerId, filtroNome) — Inicializa grupo de chips
  5. popularSelectBairros(bairros) — Popula selects de bairro
  6. carregarListaAlertas(appendMode) — Carrega lista com filtros e paginação
  7. recarregarLista() — Recarrega do zero
  8. recarregarListaDebounced — Recarrega com debounce 300ms
  9. carregarMais() — Carrega próxima página
  10. carregarAlertasHome() — Carrega alertas recentes na Home
  11. carregarContadoresHome() — Carrega contadores da Home
  12. animarContador(elemento, valorFinal) — Anima counter com easing
  13. adicionarListenersCards(container) — Click nos cards para detalhe
  14. inicializarBotaoCarregarMais() — Inicializa botões carregar mais e retry
*/
