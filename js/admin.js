/* ========== INÍCIO: admin.js | path: pataalerta/js/admin.js ========== */

/**
 * PataAlerta — Painel Administrativo
 * Login local, gerenciamento de alertas e denúncias
 * Todas as funções com try/catch obrigatório
 */

/* ---------- CONFIGURAÇÃO ADMIN ---------- */

/**
 * Senha do admin — altere para uma senha forte
 * IMPORTANTE: esta senha é armazenada no código client-side.
 * Para o MVP de uma cidade pequena com admin único, é proporcional.
 * Em versões futuras, migrar para Firebase Auth.
 */
var ADMIN_SENHA = 'pataalerta2025';

/* ---------- ESTADO ADMIN ---------- */

var adminAutenticado = false;
var alertaParaRemover = null;

/* ---------- LOGIN ---------- */

/**
 * Verifica se o admin está autenticado (sessão)
 * @returns {boolean}
 */
function isAdminAutenticado() {
  try {
    if (adminAutenticado) return true;
    var sessao = sessionStorage.getItem('pataalerta_admin');
    if (sessao === 'true') {
      adminAutenticado = true;
      return true;
    }
    return false;
  } catch (error) {
    return adminAutenticado;
  }
}

/**
 * Realiza login do admin
 * @param {string} senha
 * @returns {boolean} Sucesso
 */
function loginAdmin(senha) {
  try {
    if (senha === ADMIN_SENHA) {
      adminAutenticado = true;
      sessionStorage.setItem('pataalerta_admin', 'true');
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Realiza logout do admin
 */
function logoutAdmin() {
  try {
    adminAutenticado = false;
    sessionStorage.removeItem('pataalerta_admin');
  } catch (error) {
    adminAutenticado = false;
  }
}

/* ---------- INICIALIZAÇÃO ---------- */

/**
 * Inicializa o painel admin
 */
function inicializarAdmin() {
  try {
    inicializarLoginAdmin();
    inicializarTabsAdmin();
    inicializarModalRemover();
  } catch (error) {
    console.error('Erro ao inicializar admin:', error);
  }
}

/**
 * Inicializa o formulário de login admin
 */
function inicializarLoginAdmin() {
  try {
    var btnLogin = document.getElementById('btnAdminLogin');
    var inputSenha = document.getElementById('inputAdminSenha');
    var btnLogout = document.getElementById('btnAdminLogout');

    if (btnLogin) {
      btnLogin.addEventListener('click', function () {
        tentarLoginAdmin();
      });
    }

    // Enter para login
    if (inputSenha) {
      inputSenha.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          tentarLoginAdmin();
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        logoutAdmin();
        exibirTelaLoginAdmin();
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar login admin:', error);
  }
}

/**
 * Tenta fazer login com a senha digitada
 */
function tentarLoginAdmin() {
  try {
    var inputSenha = document.getElementById('inputAdminSenha');
    var errorSenha = document.getElementById('errorAdminSenha');
    var senha = inputSenha ? inputSenha.value : '';

    if (!senha) {
      if (errorSenha) errorSenha.textContent = 'Digite a senha';
      return;
    }

    if (loginAdmin(senha)) {
      if (errorSenha) errorSenha.textContent = '';
      exibirPainelAdmin();
      carregarDadosAdmin();
    } else {
      if (errorSenha) errorSenha.textContent = 'Senha incorreta';
      if (inputSenha) {
        inputSenha.value = '';
        inputSenha.focus();
      }
    }
  } catch (error) {
    console.error('Erro ao tentar login:', error);
  }
}

/**
 * Exibe a tela de login (esconde painel)
 */
function exibirTelaLoginAdmin() {
  try {
    var loginEl = document.getElementById('adminLogin');
    var painelEl = document.getElementById('adminPanel');
    var inputSenha = document.getElementById('inputAdminSenha');

    if (loginEl) loginEl.style.display = 'block';
    if (painelEl) painelEl.style.display = 'none';
    if (inputSenha) {
      inputSenha.value = '';
      inputSenha.focus();
    }
  } catch (error) {
    // Silencioso
  }
}

/**
 * Exibe o painel admin (esconde login)
 */
function exibirPainelAdmin() {
  try {
    var loginEl = document.getElementById('adminLogin');
    var painelEl = document.getElementById('adminPanel');

    if (loginEl) loginEl.style.display = 'none';
    if (painelEl) painelEl.style.display = 'block';
  } catch (error) {
    // Silencioso
  }
}

/* ---------- CARREGAR TELA ADMIN ---------- */

/**
 * Carrega a tela admin (verifica autenticação)
 */
function carregarTelaAdmin() {
  try {
    if (isAdminAutenticado()) {
      exibirPainelAdmin();
      carregarDadosAdmin();
    } else {
      exibirTelaLoginAdmin();
    }
  } catch (error) {
    console.error('Erro ao carregar tela admin:', error);
    exibirTelaLoginAdmin();
  }
}

/**
 * Carrega dados do painel admin (alertas + denúncias)
 */
function carregarDadosAdmin() {
  try {
    carregarAlertasAdmin();
    carregarDenunciasAdmin();
  } catch (error) {
    console.error('Erro ao carregar dados admin:', error);
  }
}

/* ---------- TABS ADMIN ---------- */

/**
 * Inicializa as tabs do painel admin
 */
function inicializarTabsAdmin() {
  try {
    var tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var tabName = tab.getAttribute('data-tab');

        // Atualizar tabs
        tabs.forEach(function (t) {
          t.classList.remove('admin-tab--active');
        });
        tab.classList.add('admin-tab--active');

        // Mostrar/esconder conteúdo
        var contentAlertas = document.getElementById('adminAlertas');
        var contentDenuncias = document.getElementById('adminDenuncias');

        if (tabName === 'alertas') {
          if (contentAlertas) contentAlertas.style.display = 'block';
          if (contentDenuncias) contentDenuncias.style.display = 'none';
        } else {
          if (contentAlertas) contentAlertas.style.display = 'none';
          if (contentDenuncias) contentDenuncias.style.display = 'block';
        }
      });
    });
  } catch (error) {
    console.error('Erro ao inicializar tabs:', error);
  }
}

/* ---------- ALERTAS ADMIN ---------- */

/**
 * Carrega lista de alertas no painel admin
 */
function carregarAlertasAdmin() {
  try {
    var container = document.getElementById('adminAlertsList');
    if (!container) return;

    container.innerHTML = '<div class="skeleton-card" style="height:100px;"></div>';

    listarAlertasAdmin()
      .then(function (alertas) {
        if (alertas.length === 0) {
          container.innerHTML = '<div class="empty-state"><p>Nenhum alerta cadastrado.</p></div>';
          return;
        }

        container.innerHTML = '';
        alertas.forEach(function (alerta) {
          var cardHTML = renderizarCardAdmin(alerta);
          container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Renderizar ícones
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        // Listeners
        adicionarListenersAdmin(container);
      })
      .catch(function (error) {
        console.error('Erro ao carregar alertas admin:', error);
        container.innerHTML = '<div class="error-state"><p>Erro ao carregar alertas.</p></div>';
      });
  } catch (error) {
    console.error('Erro ao carregar alertas admin:', error);
  }
}

/**
 * Renderiza card de alerta para o painel admin
 * @param {object} alerta
 * @returns {string} HTML
 */
function renderizarCardAdmin(alerta) {
  try {
    var badgeClasse = alerta.status === 'resolvido' ? 'badge--resolvido' : classeBadge(alerta.tipo);
    var badgeTexto = alerta.status === 'resolvido' ? '✅ Resolvido' : labelTipo(alerta.tipo);
    var nomeExibicao = alerta.nome ? alerta.nome : capitalizar(alerta.especie);
    var tempoRelativo = formatarTempoRelativo(alerta.criadoEm);

    var botoesStatus = '';
    if (alerta.status === 'ativo') {
      botoesStatus = '' +
        '<button class="btn btn--sm btn--secondary admin-btn-resolver" data-id="' + alerta.id + '">' +
          '<i data-lucide="check"></i> Resolvido' +
        '</button>';
    } else if (alerta.status === 'resolvido') {
      botoesStatus = '' +
        '<button class="btn btn--sm btn--secondary admin-btn-reativar" data-id="' + alerta.id + '">' +
          '<i data-lucide="rotate-ccw"></i> Reativar' +
        '</button>';
    }

    var html = '' +
      '<article class="card" data-admin-id="' + alerta.id + '">' +
        '<div class="card__body" style="display:flex;gap:var(--space-md);align-items:center;flex-wrap:wrap;">' +
          '<img src="' + alerta.foto + '" alt="" style="width:60px;height:60px;border-radius:var(--radius-sm);object-fit:cover;" loading="lazy">' +
          '<div style="flex:1;min-width:150px;">' +
            '<span class="badge ' + badgeClasse + '" style="position:static;margin-bottom:var(--space-xs);display:inline-flex;">' + badgeTexto + '</span>' +
            '<h3 class="card__nome" style="font-size:var(--text-body);">' + nomeExibicao + '</h3>' +
            '<span style="font-size:var(--text-caption);color:var(--neutral-400);">' + alerta.bairro + ' • ' + tempoRelativo + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:var(--space-sm);flex-wrap:wrap;">' +
            botoesStatus +
            '<button class="btn btn--sm btn--danger admin-btn-remover" data-id="' + alerta.id + '">' +
              '<i data-lucide="trash-2"></i> Remover' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';

    return html;
  } catch (error) {
    console.error('Erro ao renderizar card admin:', error);
    return '';
  }
}

/**
 * Adiciona listeners nos cards do admin
 * @param {HTMLElement} container
 */
function adicionarListenersAdmin(container) {
  try {
    // Botões resolver
    var btnsResolver = container.querySelectorAll('.admin-btn-resolver');
    btnsResolver.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-id');
        alterarStatusAlerta(id, 'resolvido')
          .then(function (resultado) {
            if (resultado.sucesso) {
              mostrarToast('Alerta marcado como resolvido', 'success');
              carregarAlertasAdmin();
            } else {
              mostrarToast(resultado.erro, 'error');
            }
          });
      });
    });

    // Botões reativar
    var btnsReativar = container.querySelectorAll('.admin-btn-reativar');
    btnsReativar.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-id');
        alterarStatusAlerta(id, 'ativo')
          .then(function (resultado) {
            if (resultado.sucesso) {
              mostrarToast('Alerta reativado', 'success');
              carregarAlertasAdmin();
            } else {
              mostrarToast(resultado.erro, 'error');
            }
          });
      });
    });

    // Botões remover
    var btnsRemover = container.querySelectorAll('.admin-btn-remover');
    btnsRemover.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-id');
        abrirModalRemover(id);
      });
    });
  } catch (error) {
    console.error('Erro ao adicionar listeners admin:', error);
  }
}

/* ---------- DENÚNCIAS ADMIN ---------- */

/**
 * Carrega lista de denúncias no painel admin
 */
function carregarDenunciasAdmin() {
  try {
    var container = document.getElementById('adminDenunciasList');
    if (!container) return;

    container.innerHTML = '<div class="skeleton-card" style="height:80px;"></div>';

    listarDenunciasAdmin()
      .then(function (denuncias) {
        if (denuncias.length === 0) {
          container.innerHTML = '<div class="empty-state"><p>Nenhuma denúncia recebida.</p></div>';
          return;
        }

        container.innerHTML = '';
        denuncias.forEach(function (denuncia) {
          var tempoRelativo = formatarTempoRelativo(denuncia.criadoEm);

          var html = '' +
            '<div class="denuncia-item">' +
              '<div class="denuncia-item__alerta">Alerta: ' + denuncia.alertaId + '</div>' +
              '<div class="denuncia-item__motivo">' + denuncia.motivo + '</div>' +
              '<div class="denuncia-item__time">' + tempoRelativo + '</div>' +
            '</div>';

          container.insertAdjacentHTML('beforeend', html);
        });
      })
      .catch(function (error) {
        console.error('Erro ao carregar denúncias:', error);
        container.innerHTML = '<div class="error-state"><p>Erro ao carregar denúncias.</p></div>';
      });
  } catch (error) {
    console.error('Erro ao carregar denúncias admin:', error);
  }
}

/* ---------- MODAL REMOVER ---------- */

/**
 * Abre modal de confirmação de remoção
 * @param {string} alertaId
 */
function abrirModalRemover(alertaId) {
  try {
    alertaParaRemover = alertaId;
    var modal = document.getElementById('modalRemover');
    if (modal) modal.style.display = 'flex';
  } catch (error) {
    // Silencioso
  }
}

/**
 * Fecha modal de remoção
 */
function fecharModalRemover() {
  try {
    alertaParaRemover = null;
    var modal = document.getElementById('modalRemover');
    if (modal) modal.style.display = 'none';
  } catch (error) {
    // Silencioso
  }
}

/**
 * Inicializa listeners do modal de remoção
 */
function inicializarModalRemover() {
  try {
    var btnCancel = document.getElementById('btnCancelRemover');
    var btnConfirm = document.getElementById('btnConfirmRemover');
    var overlay = document.getElementById('modalRemoverOverlay');

    if (btnCancel) {
      btnCancel.addEventListener('click', fecharModalRemover);
    }

    if (overlay) {
      overlay.addEventListener('click', fecharModalRemover);
    }

    if (btnConfirm) {
      btnConfirm.addEventListener('click', function () {
        confirmarRemocao();
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar modal remover:', error);
  }
}

/**
 * Confirma e executa a remoção do alerta
 */
function confirmarRemocao() {
  try {
    if (!alertaParaRemover) return;

    removerAlerta(alertaParaRemover)
      .then(function (resultado) {
        fecharModalRemover();
        if (resultado.sucesso) {
          mostrarToast('Alerta removido', 'success');
          carregarAlertasAdmin();
        } else {
          mostrarToast(resultado.erro, 'error');
        }
      })
      .catch(function () {
        fecharModalRemover();
        mostrarToast('Erro ao remover. Tente pelo console Firebase.', 'error');
      });
  } catch (error) {
    console.error('Erro ao confirmar remoção:', error);
    fecharModalRemover();
  }
}

/* ========== FIM: admin.js | path: pataalerta/js/admin.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. isAdminAutenticado() — Verifica autenticação do admin
  2. loginAdmin(senha) — Realiza login
  3. logoutAdmin() — Realiza logout
  4. inicializarAdmin() — Inicializa painel admin completo
  5. inicializarLoginAdmin() — Inicializa formulário de login
  6. tentarLoginAdmin() — Tenta login com senha digitada
  7. exibirTelaLoginAdmin() — Exibe tela de login
  8. exibirPainelAdmin() — Exibe painel admin
  9. carregarTelaAdmin() — Carrega tela admin (verifica auth)
  10. carregarDadosAdmin() — Carrega alertas + denúncias
  11. inicializarTabsAdmin() — Inicializa tabs alertas/denúncias
  12. carregarAlertasAdmin() — Carrega lista de alertas
  13. renderizarCardAdmin(alerta) — Renderiza card admin
  14. adicionarListenersAdmin(container) — Listeners dos cards admin
  15. carregarDenunciasAdmin() — Carrega lista de denúncias
  16. abrirModalRemover(alertaId) — Abre modal de remoção
  17. fecharModalRemover() — Fecha modal de remoção
  18. inicializarModalRemover() — Listeners do modal de remoção
  19. confirmarRemocao() — Executa remoção do alerta
*/
