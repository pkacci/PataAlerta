/* ========== INÍCIO: storage.js | path: pataalerta/js/storage.js ========== */
// Versão: 1.1 | Alteração: Correção de sintaxe (chaves órfãs) e alinhamento de Promises

var IMGBB_API_KEY = '8f4871ff73978f1139fd8f5e4ffdcd77';

/**
 * Faz upload de uma foto para o ImgBB
 */
function uploadFoto(file, onProgress) {
    try {
        if (!IMGBB_API_KEY || IMGBB_API_KEY.trim() === '') {
            return Promise.resolve({
                sucesso: false,
                url: '',
                erro: 'ImgBB não configurado.'
            });
        }

        // Simulação de validação (certifique-se que validarImagem existe no global)
        if (typeof validarImagem === 'function') {
            var validacao = validarImagem(file);
            if (!validacao.valido) {
                return Promise.resolve({ sucesso: false, url: '', erro: validacao.erro });
            }
        }

        if (typeof onProgress === 'function') onProgress(10);

        // Fluxo de execução
        return comprimirImagem(file)
            .then(function (blobComprimido) {
                if (typeof onProgress === 'function') onProgress(30);
                return blobParaBase64(blobComprimido);
            })
            .then(function (base64Data) {
                if (typeof onProgress === 'function') onProgress(50);
                return enviarParaImgBB(base64Data, onProgress);
            })
            .catch(function (error) {
                console.error('Erro no fluxo de upload:', error);
                return {
                    sucesso: false,
                    url: '',
                    erro: 'Erro ao processar a foto.'
                };
            });
    } catch (error) {
        console.error('Erro crítico em uploadFoto:', error);
        return Promise.resolve({
            sucesso: false,
            url: '',
            erro: 'Erro inesperado no sistema de arquivos.'
        });
    }
}

/**
 * Envia imagem base64 para a API do ImgBB
 */
function enviarParaImgBB(base64Data, onProgress) {
    return new Promise(function (resolve) {
        try {
            var formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64Data);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.imgbb.com/1/upload', true);

            xhr.upload.addEventListener('progress', function (e) {
                if (e.lengthComputable && typeof onProgress === 'function') {
                    var percentual = 50 + Math.round((e.loaded / e.total) * 45);
                    onProgress(Math.min(percentual, 95));
                }
            });

            xhr.timeout = 30000;

            xhr.onload = function () {
                try {
                    if (xhr.status === 200) {
                        var resposta = JSON.parse(xhr.responseText);
                        if (resposta.success && resposta.data && resposta.data.url) {
                            if (typeof onProgress === 'function') onProgress(100);
                            resolve({ sucesso: true, url: resposta.data.url, erro: '' });
                        } else {
                            resolve({ sucesso: false, url: '', erro: 'Erro na resposta do ImgBB.' });
                        }
                    } else {
                        resolve({ sucesso: false, url: '', erro: traduzirErroImgBB(xhr.status) });
                    }
                } catch (e) {
                    resolve({ sucesso: false, url: '', erro: 'Erro ao ler resposta.' });
                }
            };

            xhr.onerror = function () { resolve({ sucesso: false, url: '', erro: 'Erro de conexão.' }); };
            xhr.ontimeout = function () { resolve({ sucesso: false, url: '', erro: 'Tempo esgotado.' }); };

            xhr.send(formData);
        } catch (error) {
            resolve({ sucesso: false, url: '', erro: 'Falha no envio.' });
        }
    });
}

function blobParaBase64(blob) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result.split(',')[1]); };
        reader.onerror = function () { reject(new Error('Erro no reader')); };
        reader.readAsDataURL(blob);
    });
}

function traduzirErroImgBB(status) {
    var mensagens = { 400: 'Imagem inválida.', 401: 'Chave inválida.', 403: 'Acesso negado.', 429: 'Muitos envios.' };
    return mensagens[status] || 'Erro ' + status;
}

function gerarPreviewLocal(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) { resolve(e.target.result); };
        reader.onerror = function () { reject(new Error('Erro no preview')); };
        reader.readAsDataURL(file);
    });
}
/* ========== FIM: storage.js | path: pataalerta/js/storage.js ========== */
// FUNÇÕES PRESENTES: uploadFoto, enviarParaImgBB, blobParaBase64, traduzirErroImgBB, gerarPreviewLocal
