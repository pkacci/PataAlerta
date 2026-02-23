/* ========== INÍCIO: storage.js | path: pataalerta/js/storage.js ========== */

/**
 * PataAlerta — Upload de Fotos via ImgBB
 * Substitui Firebase Storage (que exige plano Blaze)
 * API gratuita, sem limite, URL permanente
 * Todas as funções com try/catch obrigatório
 */

/* ---------- CONFIGURAÇÃO ---------- */

/**
 * API Key do ImgBB
 * INSTRUÇÕES:
 * 1. Acesse api.imgbb.com
 * 2. Crie conta gratuita
 * 3. Copie sua API key
 * 4. Cole abaixo substituindo o placeholder
 */
var IMGBB_API_KEY = '8f4871ff73978f1139fd8f5e4ffdcd77';

/* ---------- UPLOAD ---------- */

/**
 * Faz upload de uma foto para o ImgBB
 * Comprime a imagem antes de enviar (máx 1200px, qualidade 0.8)
 * @param {File} file — Arquivo de imagem do input
 * @param {function} onProgress — Callback de progresso (0-100)
 * @returns {Promise<{ sucesso: boolean, url: string, erro: string }>}
 */
function uploadFoto(file, onProgress) {
  try {
    if (IMGBB_API_KEY === '8f4871ff73978f1139fd8f5e4ffdcd77') {
      return Promise.resolve({
        sucesso: false,
        url: '',
        erro: 'ImgBB não configurado. Abra js/storage.js e insira sua API key.'
      });
    }

    // Validar imagem antes do upload
    var validacao = validarImagem(file);
    if (!validacao.valido) {
      return Promise.resolve({
        sucesso: false,
        url: '',
        erro: validacao.erro
      });
    }

    // Indicar início do progresso
    if (typeof onProgress === 'function') {
      onProgress(10);
    }

    // Comprimir imagem antes do upload
    return comprimirImagem(file)
      .then(function (blobComprimido) {
        if (typeof onProgress === 'function') {
          onProgress(30);
        }

        // Converter blob para base64
        return blobParaBase64(blobComprimido);
      })
      .then(function (base64Data) {
        if (typeof onProgress === 'function') {
          onProgress(50);
        }

        // Enviar para ImgBB
        return enviarParaImgBB(base64Data, onProgress);
      })
      .catch(function (error) {
        console.error('Erro no upload:', error);
        return {
          sucesso: false,
          url: '',
          erro: 'Erro ao processar a foto. Tente outra imagem.'
        };
      });
  } catch (error) {
    console.error('Erro no upload:', error);
    return Promise.resolve({
      sucesso: false,
      url: '',
      erro: 'Erro inesperado. Tente novamente.'
    });
  }
}

/**
 * Envia imagem base64 para a API do ImgBB
 * @param {string} base64Data — Imagem em base64 (sem prefixo data:)
 * @param {function} onProgress — Callback de progresso
 * @returns {Promise<{ sucesso: boolean, url: string, erro: string }>}
 */
function enviarParaImgBB(base64Data, onProgress) {
  return new Promise(function (resolve) {
    try {
      var formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64Data);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.imgbb.com/1/upload', true);

      // Progresso do upload
      xhr.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable && typeof onProgress === 'function') {
          var percentual = 50 + Math.round((e.loaded / e.total) * 45);
          onProgress(Math.min(percentual, 95));
        }
      });

      // Timeout de 30 segundos
      xhr.timeout = 30000;

      xhr.onload = function () {
        try {
          if (typeof onProgress === 'function') {
            onProgress(100);
          }

          if (xhr.status === 200) {
            var resposta = JSON.parse(xhr.responseText);
            if (resposta.success && resposta.data && resposta.data.url) {
              resolve({
                sucesso: true,
                url: resposta.data.url,
                erro: ''
              });
            } else {
              resolve({
                sucesso: false,
                url: '',
                erro: 'Resposta inválida do servidor de imagens.'
              });
            }
          } else {
            var mensagem = traduzirErroImgBB(xhr.status);
            resolve({
              sucesso: false,
              url: '',
              erro: mensagem
            });
          }
        } catch (error) {
          resolve({
            sucesso: false,
            url: '',
            erro: 'Erro ao processar resposta do servidor.'
          });
        }
      };

      xhr.onerror = function () {
        resolve({
          sucesso: false,
          url: '',
          erro: 'Erro de conexão. Verifique sua internet e tente novamente.'
        });
      };

      xhr.ontimeout = function () {
        resolve({
          sucesso: false,
          url: '',
          erro: 'Upload muito lento. Verifique sua conexão e tente novamente.'
        });
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Erro ao enviar para ImgBB:', error);
      resolve({
        sucesso: false,
        url: '',
        erro: 'Erro ao enviar foto. Tente novamente.'
      });
    }
  });
}

/* ---------- CONVERSÃO ---------- */

/**
 * Converte Blob para string base64 (sem prefixo data:)
 * @param {Blob} blob
 * @returns {Promise<string>} base64 puro
 */
function blobParaBase64(blob) {
  return new Promise(function (resolve, reject) {
    try {
      var reader = new FileReader();
      reader.onload = function () {
        // Remover prefixo "data:image/jpeg;base64,"
        var base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = function () {
        reject(new Error('Não foi possível ler a imagem'));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
}

/* ---------- ERROS ---------- */

/**
 * Traduz códigos de erro HTTP para mensagens amigáveis
 * @param {number} status — Código HTTP
 * @returns {string} Mensagem amigável
 */
function traduzirErroImgBB(status) {
  var mensagens = {
    400: 'Imagem inválida. Tente outra foto.',
    401: 'API key inválida. Verifique a configuração.',
    403: 'Acesso negado. Verifique sua API key.',
    413: 'Foto muito grande. Tente uma imagem menor.',
    429: 'Muitos envios. Aguarde um momento e tente novamente.',
    500: 'Servidor de imagens indisponível. Tente novamente.',
    503: 'Serviço temporariamente fora do ar. Tente novamente.'
  };

  return mensagens[status] || 'Erro ao enviar foto (código ' + status + '). Tente novamente.';
}

/* ---------- PREVIEW ---------- */

/**
 * Gera preview local da imagem selecionada (sem upload)
 * @param {File} file — Arquivo de imagem
 * @returns {Promise<string>} URL local para preview (data URL)
 */
function gerarPreviewLocal(file) {
  return new Promise(function (resolve, reject) {
    try {
      var reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.onerror = function () {
        reject(new Error('Não foi possível ler a imagem'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

/* ========== FIM: storage.js | path: pataalerta/js/storage.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. uploadFoto(file, onProgress) — Upload com compressão, progresso e timeout via ImgBB
  2. enviarParaImgBB(base64Data, onProgress) — Envia base64 para API ImgBB
  3. blobParaBase64(blob) — Converte Blob para base64 puro
  4. traduzirErroImgBB(status) — Traduz erros HTTP para mensagens amigáveis
  5. gerarPreviewLocal(file) — Gera preview local sem upload
*/
