/* ========== INÍCIO: storage.js | path: pataalerta/js/storage.js ========== */

/**
 * PataAlerta — Firebase Storage
 * Upload, URL e gerenciamento de fotos dos animais
 * Todas as funções com try/catch obrigatório
 */

/**
 * Faz upload de uma foto para o Firebase Storage
 * Comprime a imagem antes de enviar (máx 1200px, qualidade 0.8)
 * @param {File} file — Arquivo de imagem do input
 * @param {function} onProgress — Callback de progresso (0-100)
 * @returns {Promise<{ sucesso: boolean, url: string, erro: string }>}
 */
function uploadFoto(file, onProgress) {
  try {
    var storageRef = getStorage();
    if (!storageRef) {
      return Promise.resolve({
        sucesso: false,
        url: '',
        erro: 'Firebase Storage não está configurado'
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

    // Comprimir imagem antes do upload
    return comprimirImagem(file)
      .then(function (blobComprimido) {
        // Gerar nome único para o arquivo
        var nomeArquivo = gerarNomeArquivo(file.name);
        var ref = storageRef.ref('alertas/' + nomeArquivo);

        // Iniciar upload
        var uploadTask = ref.put(blobComprimido, {
          contentType: 'image/jpeg'
        });

        return new Promise(function (resolve) {
          uploadTask.on(
            'state_changed',
            // Progresso
            function (snapshot) {
              try {
                var progresso = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                if (typeof onProgress === 'function') {
                  onProgress(progresso);
                }
              } catch (e) {
                // Silencioso
              }
            },
            // Erro
            function (error) {
              console.error('Erro no upload:', error);
              var mensagemErro = traduzirErroStorage(error.code);
              resolve({
                sucesso: false,
                url: '',
                erro: mensagemErro
              });
            },
            // Sucesso
            function () {
              uploadTask.snapshot.ref.getDownloadURL()
                .then(function (url) {
                  resolve({
                    sucesso: true,
                    url: url,
                    erro: ''
                  });
                })
                .catch(function (error) {
                  console.error('Erro ao obter URL:', error);
                  resolve({
                    sucesso: false,
                    url: '',
                    erro: 'Foto enviada mas não foi possível obter o link'
                  });
                });
            }
          );

          // Timeout de 30 segundos
          setTimeout(function () {
            try {
              if (uploadTask.snapshot.state === 'running') {
                uploadTask.cancel();
                resolve({
                  sucesso: false,
                  url: '',
                  erro: 'Upload muito lento. Verifique sua conexão e tente novamente.'
                });
              }
            } catch (e) {
              // Silencioso
            }
          }, 30000);
        });
      })
      .catch(function (error) {
        console.error('Erro ao comprimir imagem:', error);
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
 * Gera nome único para o arquivo de foto
 * Formato: {timestamp}_{random}.jpg
 * @param {string} nomeOriginal — Nome original do arquivo
 * @returns {string} Nome único
 */
function gerarNomeArquivo(nomeOriginal) {
  var timestamp = Date.now();
  var random = Math.random().toString(36).substring(2, 8);
  return timestamp + '_' + random + '.jpg';
}

/**
 * Traduz códigos de erro do Firebase Storage para mensagens amigáveis
 * @param {string} errorCode — Código de erro do Firebase
 * @returns {string} Mensagem amigável
 */
function traduzirErroStorage(errorCode) {
  var mensagens = {
    'storage/unauthorized': 'Sem permissão para enviar. Verifique as regras do Storage.',
    'storage/canceled': 'Upload cancelado.',
    'storage/retry-limit-exceeded': 'Conexão instável. Tente novamente.',
    'storage/invalid-checksum': 'Arquivo corrompido. Tente outra foto.',
    'storage/server-file-wrong-size': 'Erro no envio. Tente novamente.',
    'storage/quota-exceeded': 'Limite de armazenamento atingido. Entre em contato com o administrador.',
    'storage/unauthenticated': 'Erro de autenticação. Recarregue a página.',
    'storage/unknown': 'Erro desconhecido. Tente novamente.'
  };

  return mensagens[errorCode] || 'Erro ao enviar foto. Tente novamente.';
}

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
  1. uploadFoto(file, onProgress) — Upload com compressão, progresso e timeout
  2. gerarNomeArquivo(nomeOriginal) — Gera nome único para o arquivo
  3. traduzirErroStorage(errorCode) — Traduz erros Firebase para mensagens amigáveis
  4. gerarPreviewLocal(file) — Gera preview local sem upload
*/
