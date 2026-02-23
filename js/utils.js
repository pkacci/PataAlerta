/* ========== INÍCIO: utils.js | path: pataalerta/js/utils.js ========== */

/**
 * PataAlerta — Funções Utilitárias
 * Validação, formatação, deviceId, datas, máscaras, compartilhamento
 */

/* ---------- DEVICE ID (Anti-spam) ---------- */

/**
 * Gera ou recupera um ID único do dispositivo via localStorage
 * @returns {string} deviceId
 */
function getDeviceId() {
  try {
    let deviceId = localStorage.getItem('pataalerta_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('pataalerta_device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    // localStorage indisponível — gera ID de sessão
    return 'dev_session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }
}

/**
 * Verifica se o dispositivo atingiu o limite diário de alertas
 * @param {number} limite — Máximo de alertas por dia (padrão: 3)
 * @returns {boolean} true se atingiu o limite
 */
function atingiuLimiteDiario(limite) {
  if (typeof limite === 'undefined') {
    limite = 3;
  }
  try {
    var hoje = new Date().toISOString().split('T')[0];
    var chave = 'pataalerta_alertas_' + hoje;
    var contagem = parseInt(localStorage.getItem(chave) || '0', 10);
    return contagem >= limite;
  } catch (error) {
    return false;
  }
}

/**
 * Incrementa o contador diário de alertas do dispositivo
 */
function incrementarContadorDiario() {
  try {
    var hoje = new Date().toISOString().split('T')[0];
    var chave = 'pataalerta_alertas_' + hoje;
    var contagem = parseInt(localStorage.getItem(chave) || '0', 10);
    localStorage.setItem(chave, String(contagem + 1));

    // Limpar contadores antigos (mais de 2 dias)
    limparContadoresAntigos();
  } catch (error) {
    // localStorage indisponível — não bloqueia
  }
}

/**
 * Remove contadores diários com mais de 2 dias
 */
function limparContadoresAntigos() {
  try {
    var hoje = new Date();
    for (var i = 0; i < localStorage.length; i++) {
      var chave = localStorage.key(i);
      if (chave && chave.startsWith('pataalerta_alertas_')) {
        var dataStr = chave.replace('pataalerta_alertas_', '');
        var dataChave = new Date(dataStr);
        var diffDias = (hoje - dataChave) / (1000 * 60 * 60 * 24);
        if (diffDias > 2) {
          localStorage.removeItem(chave);
        }
      }
    }
  } catch (error) {
    // Silencioso
  }
}

/* ---------- VALIDAÇÃO ---------- */

/**
 * Valida se um campo obrigatório está preenchido
 * @param {string} valor
 * @returns {boolean}
 */
function isPreenchido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Valida tamanho mínimo de string
 * @param {string} valor
 * @param {number} min
 * @returns {boolean}
 */
function temTamanhoMinimo(valor, min) {
  return typeof valor === 'string' && valor.trim().length >= min;
}

/**
 * Valida tamanho máximo de string
 * @param {string} valor
 * @param {number} max
 * @returns {boolean}
 */
function temTamanhoMaximo(valor, max) {
  return typeof valor === 'string' && valor.trim().length <= max;
}

/**
 * Valida se o valor está na lista permitida
 * @param {string} valor
 * @param {string[]} lista
 * @returns {boolean}
 */
function estaEmLista(valor, lista) {
  return lista.indexOf(valor) !== -1;
}

/**
 * Valida número de WhatsApp (10 ou 11 dígitos)
 * @param {string} whatsapp — Apenas números
 * @returns {boolean}
 */
function validarWhatsapp(whatsapp) {
  var numeros = whatsapp.replace(/\D/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
}

/**
 * Valida arquivo de imagem (tipo e tamanho)
 * @param {File} file
 * @returns {{ valido: boolean, erro: string }}
 */
function validarImagem(file) {
  if (!file) {
    return { valido: false, erro: 'Foto obrigatória' };
  }

  var tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (tiposPermitidos.indexOf(file.type) === -1) {
    return { valido: false, erro: 'Formato inválido. Use JPG, PNG ou WebP' };
  }

  var maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valido: false, erro: 'Foto muito grande. Máximo 5MB' };
  }

  return { valido: true, erro: '' };
}

/**
 * Valida todos os campos do formulário de alerta
 * @param {object} dados — Dados do formulário
 * @returns {{ valido: boolean, erros: object }}
 */
function validarFormularioAlerta(dados) {
  var erros = {};

  if (!estaEmLista(dados.tipo, ['perdido', 'encontrado', 'doacao'])) {
    erros.tipo = 'Selecione o que aconteceu';
  }

  if (!estaEmLista(dados.especie, ['cachorro', 'gato', 'outro'])) {
    erros.especie = 'Selecione o animal';
  }

  if (!temTamanhoMinimo(dados.descricao, 10)) {
    erros.descricao = 'Descrição deve ter pelo menos 10 caracteres';
  }

  if (!temTamanhoMaximo(dados.descricao, 500)) {
    erros.descricao = 'Descrição deve ter no máximo 500 caracteres';
  }

  if (!isPreenchido(dados.bairro)) {
    erros.bairro = 'Selecione o bairro';
  }

  if (!temTamanhoMinimo(dados.cidade, 2)) {
    erros.cidade = 'Cidade deve ter pelo menos 2 caracteres';
  }

  if (!temTamanhoMinimo(dados.nomeContato, 2)) {
    erros.nomeContato = 'Nome deve ter pelo menos 2 caracteres';
  }

  if (!validarWhatsapp(dados.whatsapp)) {
    erros.whatsapp = 'WhatsApp inválido. Use DDD + número';
  }

  if (!dados.foto) {
    erros.foto = 'Adicione uma foto do animal';
  }

  if (!dados.termos) {
    erros.termos = 'Você precisa aceitar os termos';
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros: erros
  };
}

/* ---------- FORMATAÇÃO ---------- */

/**
 * Formata número de WhatsApp para exibição: (00) 00000-0000
 * @param {string} numero — Apenas dígitos
 * @returns {string} Número formatado
 */
function formatarWhatsapp(numero) {
  var n = numero.replace(/\D/g, '');
  if (n.length === 11) {
    return '(' + n.substring(0, 2) + ') ' + n.substring(2, 7) + '-' + n.substring(7);
  }
  if (n.length === 10) {
    return '(' + n.substring(0, 2) + ') ' + n.substring(2, 6) + '-' + n.substring(6);
  }
  return numero;
}

/**
 * Gera link do WhatsApp para contato direto
 * @param {string} numero — Apenas dígitos
 * @param {string} mensagem — Texto opcional
 * @returns {string} URL wa.me
 */
function gerarLinkWhatsapp(numero, mensagem) {
  var n = numero.replace(/\D/g, '');
  var url = 'https://wa.me/55' + n;
  if (mensagem) {
    url += '?text=' + encodeURIComponent(mensagem);
  }
  return url;
}

/**
 * Formata timestamp Firebase para data legível DD/MM/YYYY às HH:MM
 * @param {object} timestamp — Firestore Timestamp
 * @returns {string} Data formatada
 */
function formatarData(timestamp) {
  try {
    var date;
    if (timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }

    var dia = String(date.getDate()).padStart(2, '0');
    var mes = String(date.getMonth() + 1).padStart(2, '0');
    var ano = date.getFullYear();
    var hora = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');

    return dia + '/' + mes + '/' + ano + ' às ' + hora + ':' + min;
  } catch (error) {
    return '';
  }
}

/**
 * Formata timestamp para tempo relativo (há X minutos, horas, dias)
 * @param {object} timestamp — Firestore Timestamp
 * @returns {string} Tempo relativo
 */
function formatarTempoRelativo(timestamp) {
  try {
    var date;
    if (timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }

    var agora = new Date();
    var diff = agora - date;
    var segundos = Math.floor(diff / 1000);
    var minutos = Math.floor(segundos / 60);
    var horas = Math.floor(minutos / 60);
    var dias = Math.floor(horas / 24);
    var semanas = Math.floor(dias / 7);

    if (minutos < 1) return 'agora';
    if (minutos < 60) return 'há ' + minutos + ' min';
    if (horas < 24) return 'há ' + horas + 'h';
    if (dias < 7) return 'há ' + dias + (dias === 1 ? ' dia' : ' dias');
    if (semanas < 5) return 'há ' + semanas + (semanas === 1 ? ' semana' : ' semanas');

    return formatarData(timestamp);
  } catch (error) {
    return '';
  }
}

/**
 * Calcula dias restantes para expiração
 * @param {object} expiraEm — Firestore Timestamp
 * @returns {number} Dias restantes (negativo se já expirou)
 */
function diasParaExpirar(expiraEm) {
  try {
    var date;
    if (expiraEm && expiraEm.toDate) {
      date = expiraEm.toDate();
    } else if (expiraEm instanceof Date) {
      date = expiraEm;
    } else {
      return 0;
    }

    var agora = new Date();
    var diff = date - agora;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}

/**
 * Trunca texto com "..." se ultrapassar o limite
 * @param {string} texto
 * @param {number} limite
 * @returns {string}
 */
function truncarTexto(texto, limite) {
  if (!texto) return '';
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite).trim() + '...';
}

/**
 * Capitaliza a primeira letra
 * @param {string} texto
 * @returns {string}
 */
function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Retorna o label do tipo de alerta
 * @param {string} tipo
 * @returns {string}
 */
function labelTipo(tipo) {
  var labels = {
    'perdido': '🔴 Perdido',
    'encontrado': '🔵 Encontrado',
    'doacao': '🟢 Doação'
  };
  return labels[tipo] || tipo;
}

/**
 * Retorna a classe CSS do badge por tipo
 * @param {string} tipo
 * @returns {string}
 */
function classeBadge(tipo) {
  var classes = {
    'perdido': 'badge--perdido',
    'encontrado': 'badge--encontrado',
    'doacao': 'badge--doacao'
  };
  return classes[tipo] || '';
}

/* ---------- MÁSCARA DE WHATSAPP ---------- */

/**
 * Aplica máscara de WhatsApp no input: (00) 00000-0000
 * @param {HTMLInputElement} input
 */
function aplicarMascaraWhatsapp(input) {
  input.addEventListener('input', function () {
    var valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    var formatado = '';
    if (valor.length > 0) {
      formatado = '(' + valor.substring(0, 2);
    }
    if (valor.length > 2) {
      formatado += ') ' + valor.substring(2, 7);
    }
    if (valor.length > 7) {
      formatado += '-' + valor.substring(7, 11);
    }

    input.value = formatado;
  });
}

/**
 * Extrai apenas os dígitos do WhatsApp formatado
 * @param {string} whatsappFormatado
 * @returns {string} Apenas dígitos
 */
function extrairDigitosWhatsapp(whatsappFormatado) {
  return whatsappFormatado.replace(/\D/g, '');
}

/* ---------- COMPARTILHAMENTO ---------- */

/**
 * Gera texto de compartilhamento para WhatsApp
 * @param {object} alerta — Dados do alerta
 * @param {string} link — URL do alerta
 * @returns {string} Texto formatado
 */
function gerarTextoCompartilhamento(alerta, link) {
  var emoji = '🐾';
  var textos = {
    'perdido': emoji + ' Animal perdido no bairro ' + alerta.bairro + '! ' + capitalizar(alerta.especie) + ', ' + truncarTexto(alerta.descricao, 80) + ' Ajude a encontrar: ' + link,
    'encontrado': emoji + ' Animal encontrado no bairro ' + alerta.bairro + '! ' + capitalizar(alerta.especie) + ', ' + truncarTexto(alerta.descricao, 80) + ' Conhece o dono? ' + link,
    'doacao': emoji + ' Animal para adoção no bairro ' + alerta.bairro + '! ' + capitalizar(alerta.especie) + ', ' + truncarTexto(alerta.descricao, 80) + ' Veja: ' + link
  };
  return textos[alerta.tipo] || emoji + ' Veja este alerta no PataAlerta: ' + link;
}

/**
 * Abre compartilhamento via WhatsApp
 * @param {string} texto
 */
function compartilharWhatsapp(texto) {
  var url = 'https://wa.me/?text=' + encodeURIComponent(texto);
  window.open(url, '_blank');
}

/**
 * Copia texto para o clipboard
 * @param {string} texto
 * @returns {Promise<boolean>}
 */
function copiarParaClipboard(texto) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () {
        return true;
      }).catch(function () {
        return copiarFallback(texto);
      });
    }
    return Promise.resolve(copiarFallback(texto));
  } catch (error) {
    return Promise.resolve(false);
  }
}

/**
 * Fallback para copiar texto (navegadores antigos)
 * @param {string} texto
 * @returns {boolean}
 */
function copiarFallback(texto) {
  try {
    var textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    var sucesso = document.execCommand('copy');
    document.body.removeChild(textarea);
    return sucesso;
  } catch (error) {
    return false;
  }
}

/**
 * Gera a URL de um alerta específico
 * @param {string} alertaId
 * @returns {string}
 */
function gerarUrlAlerta(alertaId) {
  return window.location.origin + window.location.pathname + '#/alerta/' + alertaId;
}

/* ---------- COMPRESSÃO DE IMAGEM ---------- */

/**
 * Redimensiona e comprime imagem antes do upload
 * Máximo 1200px de largura, qualidade 0.8
 * @param {File} file
 * @returns {Promise<Blob>}
 */
function comprimirImagem(file) {
  return new Promise(function (resolve, reject) {
    try {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var maxWidth = 1200;
          var width = img.width;
          var height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            function (blob) {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = function () {
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = function () {
        resolve(file);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      resolve(file);
    }
  });
}

/* ---------- TOAST (notificações) ---------- */

/**
 * Exibe uma notificação toast
 * @param {string} mensagem
 * @param {string} tipo — 'success' | 'error' | 'warning' | 'info'
 * @param {number} duracao — Duração em ms (padrão: 3000)
 */
function mostrarToast(mensagem, tipo, duracao) {
  if (typeof tipo === 'undefined') tipo = 'info';
  if (typeof duracao === 'undefined') duracao = 3000;

  try {
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var iconMap = {
      'success': 'check-circle',
      'error': 'x-circle',
      'warning': 'alert-triangle',
      'info': 'info'
    };

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + tipo;
    toast.innerHTML = '<i data-lucide="' + (iconMap[tipo] || 'info') + '"></i><span>' + mensagem + '</span>';

    container.appendChild(toast);

    // Renderizar ícone Lucide
    if (typeof lucide !== 'undefined') {
      lucide.createIcons({ nodes: [toast] });
    }

    // Remover após duração
    setTimeout(function () {
      toast.classList.add('toast--exit');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duracao);
  } catch (error) {
    // Silencioso
  }
}

/* ---------- CACHE DE CONFIG ---------- */

/**
 * Salva config no localStorage com TTL de 24h
 * @param {object} config
 */
function salvarConfigCache(config) {
  try {
    var dados = {
      config: config,
      timestamp: Date.now()
    };
    localStorage.setItem('pataalerta_config', JSON.stringify(dados));
  } catch (error) {
    // localStorage indisponível
  }
}

/**
 * Recupera config do cache se ainda válida (24h)
 * @returns {object|null}
 */
function obterConfigCache() {
  try {
    var dados = localStorage.getItem('pataalerta_config');
    if (!dados) return null;

    var parsed = JSON.parse(dados);
    var agora = Date.now();
    var ttl = 24 * 60 * 60 * 1000; // 24 horas

    if (agora - parsed.timestamp > ttl) {
      localStorage.removeItem('pataalerta_config');
      return null;
    }

    return parsed.config;
  } catch (error) {
    return null;
  }
}

/* ---------- SCROLL ---------- */

/**
 * Rola a página suavemente para o topo
 */
function scrollParaTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- DEBOUNCE ---------- */

/**
 * Cria função com debounce
 * @param {Function} func
 * @param {number} delay — Delay em ms (padrão: 300)
 * @returns {Function}
 */
function debounce(func, delay) {
  if (typeof delay === 'undefined') delay = 300;
  var timer;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      func.apply(context, args);
    }, delay);
  };
}

/* ========== FIM: utils.js | path: pataalerta/js/utils.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. getDeviceId() — Gera/recupera ID único do dispositivo
  2. atingiuLimiteDiario(limite) — Verifica limite diário de alertas
  3. incrementarContadorDiario() — Incrementa contador diário
  4. limparContadoresAntigos() — Remove contadores de dias anteriores
  5. isPreenchido(valor) — Valida campo obrigatório
  6. temTamanhoMinimo(valor, min) — Valida tamanho mínimo
  7. temTamanhoMaximo(valor, max) — Valida tamanho máximo
  8. estaEmLista(valor, lista) — Valida valor em lista permitida
  9. validarWhatsapp(whatsapp) — Valida número WhatsApp
  10. validarImagem(file) — Valida tipo e tamanho de imagem
  11. validarFormularioAlerta(dados) — Valida formulário completo
  12. formatarWhatsapp(numero) — Formata número para exibição
  13. gerarLinkWhatsapp(numero, mensagem) — Gera link wa.me
  14. formatarData(timestamp) — Formata timestamp para DD/MM/YYYY
  15. formatarTempoRelativo(timestamp) — Formata tempo relativo
  16. diasParaExpirar(expiraEm) — Calcula dias para expiração
  17. truncarTexto(texto, limite) — Trunca texto com "..."
  18. capitalizar(texto) — Capitaliza primeira letra
  19. labelTipo(tipo) — Retorna label do tipo de alerta
  20. classeBadge(tipo) — Retorna classe CSS do badge
  21. aplicarMascaraWhatsapp(input) — Aplica máscara no input
  22. extrairDigitosWhatsapp(whatsappFormatado) — Extrai dígitos
  23. gerarTextoCompartilhamento(alerta, link) — Texto para WhatsApp
  24. compartilharWhatsapp(texto) — Abre WhatsApp
  25. copiarParaClipboard(texto) — Copia para clipboard
  26. copiarFallback(texto) — Fallback para copiar
  27. gerarUrlAlerta(alertaId) — Gera URL do alerta
  28. comprimirImagem(file) — Comprime imagem antes do upload
  29. mostrarToast(mensagem, tipo, duracao) — Exibe notificação toast
  30. salvarConfigCache(config) — Salva config em localStorage
  31. obterConfigCache() — Recupera config do cache
  32. scrollParaTopo() — Rola para o topo
  33. debounce(func, delay) — Cria função com debounce
*/
