/* ========== INÍCIO: ui.js | path: pataalerta/js/ui.js ========== */

/**
 * PataAlerta — Renderização de UI
 * Telas, cards, detalhe, formulário e componentes visuais
 */

/* ---------- RENDERIZAR CARD ---------- */

/**
 * Renderiza HTML de um card de alerta
 * @param {object} alerta — Dados do alerta
 * @returns {string} HTML do card
 */
function renderizarCard(alerta) {
  try {
    var isResolvido = alerta.status === 'resolvido';
    var classeResolvido = isResolvido ? ' card--resolvido' : '';
    var badgeClasse = isResolvido ? 'badge--resolvido' : classeBadge(alerta.tipo);
    var badgeTexto = isResolvido ? '✅ Resolvido' : labelTipo(alerta.tipo);
    var nomeExibicao = alerta.nome ? alerta.nome : capitalizar(alerta.especie);
    var descricaoTruncada = truncarTexto(alerta.descricao, 100);
    var tempoRelativo = formatarTempoRelativo(alerta.criadoEm);

    var html = '' +
      '<article class="card' + classeResolvido + '" data-id="' + alerta.id + '" tabindex="0" role="button" aria-label="Ver detalhes de ' + nomeExibicao + '">' +
        '<div class="card__image-wrapper">' +
          '<img class="card__image" src="' + alerta.foto + '" alt="Foto: ' + capitalizar(alerta.especie) + ' ' + alerta.tipo + ' no ' + alerta.bairro + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=&quot;card__image--placeholder&quot;><i data-lucide=&quot;image-off&quot;></i></div>\'">' +
          '<span class="badge ' + badgeClasse + '">' + badgeTexto + '</span>' +
        '</div>' +
        '<div class="card__body">' +
          '<span class="card__especie">' + capitalizar(alerta.especie) + '</span>' +
          '<h3 class="card__nome">' + nomeExibicao + '</h3>' +
          '<p class="card__descricao">' + descricaoTruncada + '</p>' +
          '<div class="card__footer">' +
            '<span class="card__location"><i data-lucide="map-pin"></i> ' + alerta.bairro + '</span>' +
            '<span class="card__time"><i data-lucide="clock"></i> ' + tempoRelativo + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';

    return html;
  } catch (error) {
    console.error('Erro ao renderizar card:', error);
    return '';
  }
}

/* ---------- RENDERIZAR DETALHE ---------- */

/**
 * Renderiza a tela de detalhe de um alerta
 * @param {object} alerta — Dados completos do alerta
 */
function renderizarDetalhe(alerta) {
  try {
    var container = document.getElementById('detalheContent');
    if (!container) return;

    var isResolvido = alerta.status === 'resolvido';
    var badgeClasse = isResolvido ? 'badge--resolvido' : classeBadge(alerta.tipo);
    var badgeTexto = isResolvido ? '✅ Resolvido' : labelTipo(alerta.tipo);
    var nomeExibicao = alerta.nome ? alerta.nome : capitalizar(alerta.especie);
    var dataFormatada = formatarData(alerta.criadoEm);
    var diasRestantes = diasParaExpirar(alerta.expiraEm);
    var linkWhatsapp = gerarLinkWhatsapp(alerta.whatsapp, 'Olá! Vi seu alerta no PataAlerta sobre o animal ' + nomeExibicao + '.');
    var urlAlerta = gerarUrlAlerta(alerta.id);

    var bannerResolvido = '';
    if (isResolvido) {
      bannerResolvido = '' +
        '<div class="detalhe__resolved-banner">' +
          '<i data-lucide="check-circle"></i>' +
          '<span>Este animal já foi encontrado!</span>' +
        '</div>';
    }

    var textoExpiracao = '';
    if (!isResolvido && diasRestantes > 0) {
      textoExpiracao = '<span class="detalhe__meta-item"><i data-lucide="timer"></i> Expira em ' + diasRestantes + ' dia' + (diasRestantes === 1 ? '' : 's') + '</span>';
    }

    var html = '' +
      '<div class="detalhe__image-wrapper">' +
        '<img class="detalhe__image" src="' + alerta.foto + '" alt="Foto: ' + capitalizar(alerta.especie) + ' ' + alerta.tipo + ' no ' + alerta.bairro + '">' +
      '</div>' +

      bannerResolvido +

      '<div class="detalhe__header">' +
        '<span class="badge detalhe__badge ' + badgeClasse + '">' + badgeTexto + '</span>' +
        '<h1 class="detalhe__title">' + nomeExibicao + '</h1>' +
        '<span class="detalhe__especie">' + capitalizar(alerta.especie) + '</span>' +
      '</div>' +

      '<div class="detalhe__section">' +
        '<h2 class="detalhe__section-title">Descrição</h2>' +
        '<p class="detalhe__descricao">' + alerta.descricao + '</p>' +
      '</div>' +

      '<div class="detalhe__section">' +
        '<h2 class="detalhe__section-title">Informações</h2>' +
        '<div class="detalhe__info">' +
          '<div class="detalhe__info-item">' +
            '<span class="detalhe__info-label">Bairro</span>' +
            '<span class="detalhe__info-value">' + alerta.bairro + '</span>' +
          '</div>' +
          '<div class="detalhe__info-item">' +
            '<span class="detalhe__info-label">Cidade</span>' +
            '<span class="detalhe__info-value">' + alerta.cidade + '</span>' +
          '</div>' +
          '<div class="detalhe__info-item">' +
            '<span class="detalhe__info-label">Contato</span>' +
            '<span class="detalhe__info-value">' + alerta.nomeContato + '</span>' +
          '</div>' +
          '<div class="detalhe__info-item">' +
            '<span class="detalhe__info-label">WhatsApp</span>' +
            '<span class="detalhe__info-value">' + formatarWhatsapp(alerta.whatsapp) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="detalhe__actions">' +
        '<a href="' + linkWhatsapp + '" target="_blank" rel="noopener" class="btn btn--whatsapp btn--lg">' +
          '<i data-lucide="message-circle"></i> Falar no WhatsApp' +
        '</a>' +
        '<div class="detalhe__secondary-actions">' +
          '<button class="btn btn--secondary" id="btnShareDetalhe" data-id="' + alerta.id + '">' +
            '<i data-lucide="share-2"></i> Compartilhar' +
          '</button>' +
          '<button class="btn btn--ghost" id="btnDenunciarDetalhe" data-id="' + alerta.id + '">' +
            '<i data-lucide="flag"></i> Denunciar' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="detalhe__meta">' +
        '<span class="detalhe__meta-item"><i data-lucide="calendar"></i> ' + dataFormatada + '</span>' +
        textoExpiracao +
      '</div>';

    container.innerHTML = html;

    // Renderizar ícones Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Listeners dos botões
    inicializarBotoesDetalhe(alerta);
  } catch (error) {
    console.error('Erro ao renderizar detalhe:', error);
    if (container) {
      container.innerHTML = '' +
        '<div class="error-state">' +
          '<i data-lucide="alert-triangle"></i>' +
          '<p>Não foi possível carregar este alerta.</p>' +
          '<a href="#/alertas" class="btn btn--secondary">Voltar aos alertas</a>' +
        '</div>';
    }
  }
}

/**
 * Inicializa os botões da tela de detalhe
 * @param {object} alerta — Dados do alerta
 */
function inicializarBotoesDetalhe(alerta) {
  try {
    // Botão compartilhar
    var btnShare = document.getElementById('btnShareDetalhe');
    if (btnShare) {
      btnShare.addEventListener('click', function () {
        var url = gerarUrlAlerta(alerta.id);
        var texto = gerarTextoCompartilhamento(alerta, url);
        compartilharWhatsapp(texto);
      });
    }

    // Botão denunciar
    var btnDenunciar = document.getElementById('btnDenunciarDetalhe');
    if (btnDenunciar) {
      btnDenunciar.addEventListener('click', function () {
        abrirModalDenuncia(alerta.id);
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar botões detalhe:', error);
  }
}

/* ---------- TELA DE DETALHE: CARREGAR ---------- */

/**
 * Carrega e exibe a tela de detalhe de um alerta
 * @param {string} alertaId — ID do alerta
 */
function carregarTelaDetalhe(alertaId) {
  try {
    var container = document.getElementById('detalheContent');
    if (container) {
      container.innerHTML = '' +
        '<div class="skeleton-grid" style="display:grid;">' +
          '<div class="skeleton-card" style="height:300px;"></div>' +
        '</div>';
    }

    buscarAlertaPorId(alertaId)
      .then(function (alerta) {
        if (alerta) {
          renderizarDetalhe(alerta);
        } else {
          if (container) {
            container.innerHTML = '' +
              '<div class="error-state">' +
                '<i data-lucide="search-x"></i>' +
                '<p>Alerta não encontrado.</p>' +
                '<a href="#/alertas" class="btn btn--secondary">Ver todos os alertas</a>' +
              '</div>';
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          }
        }
      })
      .catch(function (error) {
        console.error('Erro ao carregar detalhe:', error);
      });
  } catch (error) {
    console.error('Erro ao carregar tela detalhe:', error);
  }
}

/* ---------- MODAL DE DENÚNCIA ---------- */

var denunciaAlertaId = null;

/**
 * Abre o modal de denúncia
 * @param {string} alertaId — ID do alerta a denunciar
 */
function abrirModalDenuncia(alertaId) {
  try {
    denunciaAlertaId = alertaId;
    var modal = document.getElementById('modalDenuncia');
    var inputMotivo = document.getElementById('inputDenunciaMotivo');
    var errorMotivo = document.getElementById('errorDenunciaMotivo');

    if (modal) modal.style.display = 'flex';
    if (inputMotivo) inputMotivo.value = '';
    if (errorMotivo) errorMotivo.textContent = '';
  } catch (error) {
    console.error('Erro ao abrir modal denúncia:', error);
  }
}

/**
 * Fecha o modal de denúncia
 */
function fecharModalDenuncia() {
  try {
    denunciaAlertaId = null;
    var modal = document.getElementById('modalDenuncia');
    if (modal) modal.style.display = 'none';
  } catch (error) {
    // Silencioso
  }
}

/**
 * Inicializa os listeners do modal de denúncia
 */
function inicializarModalDenuncia() {
  try {
    var btnCancel = document.getElementById('btnCancelDenuncia');
    var btnConfirm = document.getElementById('btnConfirmDenuncia');
    var overlay = document.getElementById('modalDenunciaOverlay');

    if (btnCancel) {
      btnCancel.addEventListener('click', fecharModalDenuncia);
    }

    if (overlay) {
      overlay.addEventListener('click', fecharModalDenuncia);
    }

    if (btnConfirm) {
      btnConfirm.addEventListener('click', function () {
        enviarDenuncia();
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar modal denúncia:', error);
  }
}

/**
 * Envia a denúncia
 */
function enviarDenuncia() {
  try {
    var inputMotivo = document.getElementById('inputDenunciaMotivo');
    var errorMotivo = document.getElementById('errorDenunciaMotivo');
    var motivo = inputMotivo ? inputMotivo.value.trim() : '';

    if (!temTamanhoMinimo(motivo, 5)) {
      if (errorMotivo) errorMotivo.textContent = 'Descreva o motivo (mínimo 5 caracteres)';
      return;
    }

    if (!denunciaAlertaId) return;

    criarDenuncia(denunciaAlertaId, motivo)
      .then(function (resultado) {
        if (resultado.sucesso) {
          fecharModalDenuncia();
          mostrarToast('Denúncia enviada. Obrigado!', 'success');
        } else {
          if (errorMotivo) errorMotivo.textContent = resultado.erro;
        }
      })
      .catch(function () {
        if (errorMotivo) errorMotivo.textContent = 'Erro ao enviar. Tente novamente.';
      });
  } catch (error) {
    console.error('Erro ao enviar denúncia:', error);
  }
}

/* ---------- FORMULÁRIO: INICIALIZAÇÃO ---------- */

/**
 * Inicializa o formulário de novo alerta
 */
function inicializarFormulario() {
  try {
    var form = document.getElementById('formAlerta');
    var inputFoto = document.getElementById('inputFoto');
    var inputDescricao = document.getElementById('inputDescricao');
    var inputWhatsapp = document.getElementById('inputWhatsapp');

    // Máscara WhatsApp
    if (inputWhatsapp) {
      aplicarMascaraWhatsapp(inputWhatsapp);
    }

    // Contador de caracteres
    if (inputDescricao) {
      inputDescricao.addEventListener('input', function () {
        var counter = document.getElementById('charCount');
        if (counter) {
          counter.textContent = String(inputDescricao.value.length);
        }
      });
    }

    // Preview de foto
    if (inputFoto) {
      inputFoto.addEventListener('change', function () {
        tratarSelecaoFoto(inputFoto);
      });
    }

    // Botão trocar foto
    var btnChangeFoto = document.getElementById('btnChangeFoto');
    if (btnChangeFoto) {
      btnChangeFoto.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (inputFoto) inputFoto.click();
      });
    }

    // Submit do formulário
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submeterFormulario();
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar formulário:', error);
  }
}

/**
 * Trata a seleção de foto (preview local)
 * @param {HTMLInputElement} inputFoto
 */
function tratarSelecaoFoto(inputFoto) {
  try {
    var file = inputFoto.files[0];
    if (!file) return;

    var validacao = validarImagem(file);
    var errorFoto = document.getElementById('errorFoto');

    if (!validacao.valido) {
      if (errorFoto) errorFoto.textContent = validacao.erro;
      inputFoto.value = '';
      return;
    }

    if (errorFoto) errorFoto.textContent = '';

    // Gerar preview
    gerarPreviewLocal(file)
      .then(function (dataUrl) {
        var placeholder = document.getElementById('uploadPlaceholder');
        var preview = document.getElementById('uploadPreview');
        var previewImg = document.getElementById('previewImg');

        if (placeholder) placeholder.style.display = 'none';
        if (preview) preview.style.display = 'block';
        if (previewImg) previewImg.src = dataUrl;
      })
      .catch(function () {
        if (errorFoto) errorFoto.textContent = 'Erro ao carregar preview';
      });
  } catch (error) {
    console.error('Erro ao tratar seleção de foto:', error);
  }
}

/* ---------- FORMULÁRIO: SUBMIT ---------- */

/**
 * Estado do formulário
 */
var formSubmetendo = false;

/**
 * Submete o formulário de novo alerta
 */
function submeterFormulario() {
  if (formSubmetendo) return;

  try {
    // Limpar erros
    limparErrosFormulario();

    // Coletar dados
    var dados = coletarDadosFormulario();

    // Validar
    var validacao = validarFormularioAlerta(dados);
    if (!validacao.valido) {
      exibirErrosFormulario(validacao.erros);
      return;
    }

    // Verificar limite diário
    if (atingiuLimiteDiario(3)) {
      mostrarToast('Você atingiu o limite de 3 alertas por dia. Tente amanhã.', 'warning');
      return;
    }

    // Iniciar envio
    formSubmetendo = true;
    toggleBotaoSubmit(true);

    var inputFoto = document.getElementById('inputFoto');
    var file = inputFoto ? inputFoto.files[0] : null;

    if (!file) {
      exibirErrosFormulario({ foto: 'Adicione uma foto do animal' });
      formSubmetendo = false;
      toggleBotaoSubmit(false);
      return;
    }

    // Mostrar progresso
    mostrarProgressoUpload(true);

    // 1. Upload da foto
    uploadFoto(file, function (progresso) {
      atualizarProgressoUpload(progresso);
    })
      .then(function (resultadoUpload) {
        mostrarProgressoUpload(false);

        if (!resultadoUpload.sucesso) {
          exibirErrosFormulario({ foto: resultadoUpload.erro });
          formSubmetendo = false;
          toggleBotaoSubmit(false);
          return;
        }

        // 2. Criar alerta com URL da foto
        dados.foto = resultadoUpload.url;

        return criarAlerta(dados);
      })
      .then(function (resultadoCriacao) {
        if (!resultadoCriacao) return;

        formSubmetendo = false;
        toggleBotaoSubmit(false);

        if (resultadoCriacao.sucesso) {
          // Salvar dados para tela de confirmação
          window.ultimoAlertaCriado = {
            id: resultadoCriacao.id,
            tipo: dados.tipo,
            especie: dados.especie,
            bairro: dados.bairro,
            descricao: dados.descricao
          };

          // Navegar para confirmação
          window.location.hash = '#/confirmacao';
        } else {
          mostrarErroGlobal(resultadoCriacao.erro);
        }
      })
      .catch(function (error) {
        console.error('Erro ao submeter formulário:', error);
        formSubmetendo = false;
        toggleBotaoSubmit(false);
        mostrarErroGlobal('Erro inesperado. Tente novamente.');
      });
  } catch (error) {
    console.error('Erro ao submeter formulário:', error);
    formSubmetendo = false;
    toggleBotaoSubmit(false);
  }
}

/**
 * Coleta dados do formulário
 * @returns {object}
 */
function coletarDadosFormulario() {
  var inputFoto = document.getElementById('inputFoto');
  var temArquivo = inputFoto && inputFoto.files && inputFoto.files.length > 0;

  return {
    tipo: obterValor('inputTipo'),
    especie: obterValor('inputEspecie'),
    nome: obterValor('inputNome'),
    descricao: obterValor('inputDescricao'),
    bairro: obterValor('inputBairro'),
    cidade: obterValor('inputCidade'),
    nomeContato: obterValor('inputNomeContato'),
    whatsapp: extrairDigitosWhatsapp(obterValor('inputWhatsapp')),
    foto: null, // Será preenchido após upload
    temFoto: temArquivo,
    termos: document.getElementById('inputTermos') ? document.getElementById('inputTermos').checked : false
  };
}

/**
 * Obtém valor de um input pelo ID
 * @param {string} id
 * @returns {string}
 */
function obterValor(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

/**
 * Exibe erros nos campos do formulário
 * @param {object} erros — { campo: mensagem }
 */
function exibirErrosFormulario(erros) {
  try {
    var mapaErros = {
      tipo: 'errorTipo',
      especie: 'errorEspecie',
      descricao: 'errorDescricao',
      foto: 'errorFoto',
      bairro: 'errorBairro',
      cidade: 'errorCidade',
      nomeContato: 'errorNomeContato',
      whatsapp: 'errorWhatsapp',
      termos: 'errorTermos'
    };

    var mapaInputs = {
      tipo: 'inputTipo',
      especie: 'inputEspecie',
      descricao: 'inputDescricao',
      bairro: 'inputBairro',
      cidade: 'inputCidade',
      nomeContato: 'inputNomeContato',
      whatsapp: 'inputWhatsapp'
    };

    Object.keys(erros).forEach(function (campo) {
      var errorEl = document.getElementById(mapaErros[campo]);
      if (errorEl) {
        errorEl.textContent = erros[campo];
      }

      var inputEl = document.getElementById(mapaInputs[campo]);
      if (inputEl) {
        inputEl.classList.add('input--error');
      }
    });

    // Scroll para o primeiro erro
    var primeiroErro = Object.keys(erros)[0];
    var primeiroInput = document.getElementById(mapaInputs[primeiroErro]);
    if (primeiroInput) {
      primeiroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primeiroInput.focus();
    }
  } catch (error) {
    console.error('Erro ao exibir erros:', error);
  }
}

/**
 * Limpa todos os erros do formulário
 */
function limparErrosFormulario() {
  try {
    var errorEls = document.querySelectorAll('.form__error');
    errorEls.forEach(function (el) {
      el.textContent = '';
    });

    var inputEls = document.querySelectorAll('.input--error');
    inputEls.forEach(function (el) {
      el.classList.remove('input--error');
    });

    var globalError = document.getElementById('globalError');
    if (globalError) globalError.style.display = 'none';
  } catch (error) {
    // Silencioso
  }
}

/**
 * Mostra/esconde erro global do formulário
 * @param {string} mensagem
 */
function mostrarErroGlobal(mensagem) {
  try {
    var el = document.getElementById('globalError');
    if (el) {
      el.style.display = 'flex';
      var span = el.querySelector('span');
      if (span) span.textContent = mensagem;
    }
  } catch (error) {
    // Silencioso
  }
}

/**
 * Alterna estado do botão de submit (carregando/normal)
 * @param {boolean} carregando
 */
function toggleBotaoSubmit(carregando) {
  try {
    var btn = document.getElementById('btnSubmit');
    if (!btn) return;

    var textoEl = btn.querySelector('.btn__text');
    var loadingEl = btn.querySelector('.btn__loading');

    if (carregando) {
      btn.disabled = true;
      if (textoEl) textoEl.style.display = 'none';
      if (loadingEl) loadingEl.style.display = 'inline-flex';
    } else {
      btn.disabled = false;
      if (textoEl) textoEl.style.display = 'inline';
      if (loadingEl) loadingEl.style.display = 'none';
    }
  } catch (error) {
    // Silencioso
  }
}

/**
 * Mostra/esconde barra de progresso do upload
 * @param {boolean} mostrar
 */
function mostrarProgressoUpload(mostrar) {
  try {
    var placeholder = document.getElementById('uploadPlaceholder');
    var preview = document.getElementById('uploadPreview');
    var progress = document.getElementById('uploadProgress');

    if (mostrar) {
      if (placeholder) placeholder.style.display = 'none';
      if (preview) preview.style.display = 'none';
      if (progress) progress.style.display = 'flex';
    } else {
      if (progress) progress.style.display = 'none';
    }
  } catch (error) {
    // Silencioso
  }
}

/**
 * Atualiza barra de progresso do upload
 * @param {number} percentual — 0 a 100
 */
function atualizarProgressoUpload(percentual) {
  try {
    var fill = document.getElementById('progressFill');
    if (fill) {
      fill.style.width = percentual + '%';
    }
  } catch (error) {
    // Silencioso
  }
}

/**
 * Reseta o formulário para o estado inicial
 */
function resetarFormulario() {
  try {
    var form = document.getElementById('formAlerta');
    if (form) form.reset();

    // Resetar preview de foto
    var placeholder = document.getElementById('uploadPlaceholder');
    var preview = document.getElementById('uploadPreview');
    var progress = document.getElementById('uploadProgress');
    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (progress) progress.style.display = 'none';

    // Resetar contador de caracteres
    var charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0';

    // Limpar erros
    limparErrosFormulario();

    // Resetar estado
    formSubmetendo = false;
    toggleBotaoSubmit(false);
  } catch (error) {
    // Silencioso
  }
}

/* ---------- TELA DE CONFIRMAÇÃO ---------- */

/**
 * Inicializa os botões da tela de confirmação
 */
function inicializarConfirmacao() {
  try {
    var btnShareWhatsapp = document.getElementById('btnShareWhatsapp');
    var btnCopyLink = document.getElementById('btnCopyLink');

    if (btnShareWhatsapp) {
      btnShareWhatsapp.addEventListener('click', function () {
        var alerta = window.ultimoAlertaCriado;
        if (alerta) {
          var url = gerarUrlAlerta(alerta.id);
          var texto = gerarTextoCompartilhamento(alerta, url);
          compartilharWhatsapp(texto);
        }
      });
    }

    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', function () {
        var alerta = window.ultimoAlertaCriado;
        if (alerta) {
          var url = gerarUrlAlerta(alerta.id);
          copiarParaClipboard(url)
            .then(function (sucesso) {
              if (sucesso) {
                mostrarToast('Link copiado!', 'success');
              } else {
                mostrarToast('Não foi possível copiar', 'error');
              }
            });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar confirmação:', error);
  }
}

/* ---------- MENU MOBILE ---------- */

/**
 * Inicializa o toggle do menu mobile
 */
function inicializarMenuMobile() {
  try {
    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var isOpen = menu.classList.contains('open');

        if (isOpen) {
          menu.classList.remove('open');
          menu.setAttribute('aria-hidden', 'true');
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          menu.classList.add('open');
          menu.setAttribute('aria-hidden', 'false');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      // Fechar menu ao clicar em link
      var links = menu.querySelectorAll('.header__mobile-link');
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove('open');
          menu.setAttribute('aria-hidden', 'true');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar menu mobile:', error);
  }
}

/* ---------- NAV ACTIVE STATE ---------- */

/**
 * Atualiza o estado ativo dos links de navegação
 * @param {string} rota — Rota atual ('home', 'alertas', 'novo', etc.)
 */
function atualizarNavAtivo(rota) {
  try {
    // Desktop nav
    var links = document.querySelectorAll('.header__link');
    links.forEach(function (link) {
      link.classList.remove('active');
      var nav = link.getAttribute('data-nav');
      if (nav === rota) {
        link.classList.add('active');
      }
    });

    // Mobile nav
    var mobileLinks = document.querySelectorAll('.header__mobile-link');
    mobileLinks.forEach(function (link) {
      link.classList.remove('active');
      var nav = link.getAttribute('data-nav');
      if (nav === rota) {
        link.classList.add('active');
      }
    });
  } catch (error) {
    // Silencioso
  }
}

/* ---------- FOOTER ANO ---------- */

/**
 * Define o ano atual no footer
 */
function definirAnoFooter() {
  try {
    var el = document.getElementById('footerYear');
    if (el) {
      el.textContent = String(new Date().getFullYear());
    }
  } catch (error) {
    // Silencioso
  }
}

/* ========== FIM: ui.js | path: pataalerta/js/ui.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. renderizarCard(alerta) — Renderiza HTML de um card
  2. renderizarDetalhe(alerta) — Renderiza tela de detalhe completa
  3. inicializarBotoesDetalhe(alerta) — Listeners dos botões do detalhe
  4. carregarTelaDetalhe(alertaId) — Carrega e exibe detalhe
  5. abrirModalDenuncia(alertaId) — Abre modal de denúncia
  6. fecharModalDenuncia() — Fecha modal de denúncia
  7. inicializarModalDenuncia() — Listeners do modal de denúncia
  8. enviarDenuncia() — Envia denúncia ao Firestore
  9. inicializarFormulario() — Inicializa formulário com máscara, preview, submit
  10. tratarSelecaoFoto(inputFoto) — Preview local da foto
  11. submeterFormulario() — Submete formulário (upload + criar alerta)
  12. coletarDadosFormulario() — Coleta dados dos inputs
  13. obterValor(id) — Obtém valor de input por ID
  14. exibirErrosFormulario(erros) — Exibe erros nos campos
  15. limparErrosFormulario() — Limpa todos os erros
  16. mostrarErroGlobal(mensagem) — Mostra erro global
  17. toggleBotaoSubmit(carregando) — Alterna estado do botão
  18. mostrarProgressoUpload(mostrar) — Mostra/esconde progresso
  19. atualizarProgressoUpload(percentual) — Atualiza barra de progresso
  20. resetarFormulario() — Reseta formulário ao estado inicial
  21. inicializarConfirmacao() — Listeners da tela de confirmação
  22. inicializarMenuMobile() — Toggle do menu mobile
  23. atualizarNavAtivo(rota) — Atualiza link ativo na nav
  24. definirAnoFooter() — Define ano no footer
*/
