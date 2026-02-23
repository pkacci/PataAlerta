/* ========== INÍCIO: db.js | path: pataalerta/js/db.js ========== */

/**
 * PataAlerta — Operações Firestore
 * CRUD de alertas, denúncias e config
 * Todas as funções com try/catch obrigatório
 */

/* ---------- CONFIG ---------- */

/**
 * Carrega configuração do sistema (bairros, espécies, limites)
 * Usa cache localStorage com TTL 24h
 * @returns {Promise<object|null>}
 */
function carregarConfig() {
  try {
    // Tentar cache primeiro
    var cached = obterConfigCache();
    if (cached) {
      return Promise.resolve(cached);
    }

    var db = getDb();
    if (!db) {
      return Promise.resolve(getConfigPadrao());
    }

    return db.collection('config').doc('geral').get()
      .then(function (doc) {
        if (doc.exists) {
          var config = doc.data();
          salvarConfigCache(config);
          return config;
        }
        // Documento não existe — usar padrão
        return getConfigPadrao();
      })
      .catch(function (error) {
        console.error('Erro ao carregar config:', error);
        return getConfigPadrao();
      });
  } catch (error) {
    console.error('Erro ao carregar config:', error);
    return Promise.resolve(getConfigPadrao());
  }
}

/**
 * Retorna configuração padrão (fallback)
 * @returns {object}
 */
function getConfigPadrao() {
  return {
    bairros: ['Centro', 'Vila Nova', 'Jardim', 'Industrial', 'Outro'],
    especies: ['cachorro', 'gato', 'outro'],
    limiteDiario: 3,
    diasExpiracao: 30
  };
}

/* ---------- ALERTAS: CRIAR ---------- */

/**
 * Cria um novo alerta no Firestore
 * @param {object} dados — Dados do alerta
 * @returns {Promise<{ sucesso: boolean, id: string, erro: string }>}
 */
function criarAlerta(dados) {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve({
        sucesso: false,
        id: '',
        erro: 'Firebase não está configurado'
      });
    }

    var agora = firebase.firestore.Timestamp.now();
    var expiracao = new Date();
    expiracao.setDate(expiracao.getDate() + 30);

    var documento = {
      tipo: dados.tipo,
      especie: dados.especie,
      nome: dados.nome || '',
      descricao: dados.descricao.trim(),
      foto: dados.foto,
      bairro: dados.bairro,
      cidade: dados.cidade.trim(),
      whatsapp: dados.whatsapp,
      nomeContato: dados.nomeContato.trim(),
      status: 'ativo',
      criadoEm: agora,
      expiraEm: firebase.firestore.Timestamp.fromDate(expiracao),
      deviceId: getDeviceId()
    };

    return db.collection('alertas').add(documento)
      .then(function (docRef) {
        incrementarContadorDiario();
        return {
          sucesso: true,
          id: docRef.id,
          erro: ''
        };
      })
      .catch(function (error) {
        console.error('Erro ao criar alerta:', error);
        return {
          sucesso: false,
          id: '',
          erro: 'Não foi possível publicar. Tente novamente.'
        };
      });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return Promise.resolve({
      sucesso: false,
      id: '',
      erro: 'Erro inesperado. Tente novamente.'
    });
  }
}

/* ---------- ALERTAS: LISTAR ---------- */

/**
 * Lista alertas ativos com filtros e paginação
 * @param {object} filtros — { tipo, especie, bairro }
 * @param {number} limite — Quantidade por página (padrão: 12)
 * @param {object|null} ultimoDoc — Último documento para paginação
 * @returns {Promise<{ alertas: object[], ultimoDoc: object|null, temMais: boolean }>}
 */
function listarAlertas(filtros, limite, ultimoDoc) {
  if (typeof limite === 'undefined') limite = 12;

  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve({ alertas: [], ultimoDoc: null, temMais: false });
    }

    var query = db.collection('alertas')
      .where('status', '==', 'ativo');

    // Aplicar filtros
    if (filtros && filtros.tipo && filtros.tipo !== 'todos') {
      query = query.where('tipo', '==', filtros.tipo);
    }

    if (filtros && filtros.especie && filtros.especie !== 'todos') {
      query = query.where('especie', '==', filtros.especie);
    }

    if (filtros && filtros.bairro && filtros.bairro !== 'todos') {
      query = query.where('bairro', '==', filtros.bairro);
    }

    // Ordenação
    query = query.orderBy('criadoEm', 'desc');

    // Paginação
    if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    // Limite (+1 para saber se tem mais)
    query = query.limit(limite + 1);

    return query.get()
      .then(function (snapshot) {
        var alertas = [];
        var docs = snapshot.docs;
        var temMais = docs.length > limite;

        // Se tem mais, remover o último (era só para checar)
        if (temMais) {
          docs = docs.slice(0, limite);
        }

        docs.forEach(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          alertas.push(data);
        });

        var novoUltimoDoc = docs.length > 0 ? docs[docs.length - 1] : null;

        return {
          alertas: alertas,
          ultimoDoc: novoUltimoDoc,
          temMais: temMais
        };
      })
      .catch(function (error) {
        console.error('Erro ao listar alertas:', error);
        return { alertas: [], ultimoDoc: null, temMais: false };
      });
  } catch (error) {
    console.error('Erro ao listar alertas:', error);
    return Promise.resolve({ alertas: [], ultimoDoc: null, temMais: false });
  }
}

/**
 * Lista alertas recentes para a Home (6 últimos)
 * @returns {Promise<object[]>}
 */
function listarAlertasRecentes() {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve([]);
    }

    return db.collection('alertas')
      .where('status', '==', 'ativo')
      .orderBy('criadoEm', 'desc')
      .limit(6)
      .get()
      .then(function (snapshot) {
        var alertas = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          alertas.push(data);
        });
        return alertas;
      })
      .catch(function (error) {
        console.error('Erro ao listar alertas recentes:', error);
        return [];
      });
  } catch (error) {
    console.error('Erro ao listar alertas recentes:', error);
    return Promise.resolve([]);
  }
}

/* ---------- ALERTAS: BUSCAR POR ID ---------- */

/**
 * Busca um alerta pelo ID
 * @param {string} alertaId
 * @returns {Promise<object|null>}
 */
function buscarAlertaPorId(alertaId) {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve(null);
    }

    return db.collection('alertas').doc(alertaId).get()
      .then(function (doc) {
        if (doc.exists) {
          var data = doc.data();
          data.id = doc.id;
          return data;
        }
        return null;
      })
      .catch(function (error) {
        console.error('Erro ao buscar alerta:', error);
        return null;
      });
  } catch (error) {
    console.error('Erro ao buscar alerta:', error);
    return Promise.resolve(null);
  }
}

/* ---------- ALERTAS: CONTADORES (Stats) ---------- */

/**
 * Obtém contagem de alertas ativos e resolvidos para stats da Home
 * @returns {Promise<{ ativos: number, resolvidos: number }>}
 */
function obterContadores() {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve({ ativos: 0, resolvidos: 0 });
    }

    var promessaAtivos = db.collection('alertas')
      .where('status', '==', 'ativo')
      .get()
      .then(function (snapshot) {
        return snapshot.size;
      })
      .catch(function () {
        return 0;
      });

    var promessaResolvidos = db.collection('alertas')
      .where('status', '==', 'resolvido')
      .get()
      .then(function (snapshot) {
        return snapshot.size;
      })
      .catch(function () {
        return 0;
      });

    return Promise.all([promessaAtivos, promessaResolvidos])
      .then(function (resultados) {
        return {
          ativos: resultados[0],
          resolvidos: resultados[1]
        };
      });
  } catch (error) {
    console.error('Erro ao obter contadores:', error);
    return Promise.resolve({ ativos: 0, resolvidos: 0 });
  }
}

/* ---------- DENÚNCIAS ---------- */

/**
 * Cria uma denúncia de alerta
 * @param {string} alertaId — ID do alerta denunciado
 * @param {string} motivo — Motivo da denúncia
 * @returns {Promise<{ sucesso: boolean, erro: string }>}
 */
function criarDenuncia(alertaId, motivo) {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve({
        sucesso: false,
        erro: 'Firebase não está configurado'
      });
    }

    var documento = {
      alertaId: alertaId,
      motivo: motivo.trim(),
      criadoEm: firebase.firestore.Timestamp.now()
    };

    return db.collection('denuncias').add(documento)
      .then(function () {
        return { sucesso: true, erro: '' };
      })
      .catch(function (error) {
        console.error('Erro ao criar denúncia:', error);
        return {
          sucesso: false,
          erro: 'Não foi possível enviar. Tente novamente.'
        };
      });
  } catch (error) {
    console.error('Erro ao criar denúncia:', error);
    return Promise.resolve({
      sucesso: false,
      erro: 'Erro inesperado. Tente novamente.'
    });
  }
}

/* ---------- ADMIN: LISTAR TODOS OS ALERTAS ---------- */

/**
 * Lista todos os alertas (sem filtro de status) para o painel admin
 * @returns {Promise<object[]>}
 */
function listarAlertasAdmin() {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve([]);
    }

    return db.collection('alertas')
      .orderBy('criadoEm', 'desc')
      .get()
      .then(function (snapshot) {
        var alertas = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          alertas.push(data);
        });
        return alertas;
      })
      .catch(function (error) {
        console.error('Erro ao listar alertas admin:', error);
        return [];
      });
  } catch (error) {
    console.error('Erro ao listar alertas admin:', error);
    return Promise.resolve([]);
  }
}

/**
 * Lista todas as denúncias para o painel admin
 * @returns {Promise<object[]>}
 */
function listarDenunciasAdmin() {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve([]);
    }

    return db.collection('denuncias')
      .orderBy('criadoEm', 'desc')
      .get()
      .then(function (snapshot) {
        var denuncias = [];
        snapshot.forEach(function (doc) {
          var data = doc.data();
          data.id = doc.id;
          denuncias.push(data);
        });
        return denuncias;
      })
      .catch(function (error) {
        console.error('Erro ao listar denúncias:', error);
        return [];
      });
  } catch (error) {
    console.error('Erro ao listar denúncias:', error);
    return Promise.resolve([]);
  }
}

/* ---------- ADMIN: AÇÕES ---------- */

/**
 * Altera o status de um alerta (admin)
 * @param {string} alertaId
 * @param {string} novoStatus — 'ativo' | 'resolvido' | 'expirado'
 * @returns {Promise<{ sucesso: boolean, erro: string }>}
 */
function alterarStatusAlerta(alertaId, novoStatus) {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve({ sucesso: false, erro: 'Firebase não configurado' });
    }

    return db.collection('alertas').doc(alertaId).update({
      status: novoStatus
    })
      .then(function () {
        return { sucesso: true, erro: '' };
      })
      .catch(function (error) {
        console.error('Erro ao alterar status:', error);
        return {
          sucesso: false,
          erro: 'Não foi possível alterar. Tente pelo console Firebase.'
        };
      });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return Promise.resolve({
      sucesso: false,
      erro: 'Erro inesperado.'
    });
  }
}

/**
 * Remove um alerta (admin)
 * @param {string} alertaId
 * @returns {Promise<{ sucesso: boolean, erro: string }>}
 */
function removerAlerta(alertaId) {
  try {
    var db = getDb();
    if (!db) {
      return Promise.resolve({ sucesso: false, erro: 'Firebase não configurado' });
    }

    return db.collection('alertas').doc(alertaId).delete()
      .then(function () {
        return { sucesso: true, erro: '' };
      })
      .catch(function (error) {
        console.error('Erro ao remover alerta:', error);
        return {
          sucesso: false,
          erro: 'Não foi possível remover. Tente pelo console Firebase.'
        };
      });
  } catch (error) {
    console.error('Erro ao remover alerta:', error);
    return Promise.resolve({
      sucesso: false,
      erro: 'Erro inesperado.'
    });
  }
}

/* ========== FIM: db.js | path: pataalerta/js/db.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. carregarConfig() — Carrega config do sistema (com cache)
  2. getConfigPadrao() — Retorna config padrão (fallback)
  3. criarAlerta(dados) — Cria novo alerta no Firestore
  4. listarAlertas(filtros, limite, ultimoDoc) — Lista alertas com filtros e paginação
  5. listarAlertasRecentes() — Lista 6 alertas recentes para a Home
  6. buscarAlertaPorId(alertaId) — Busca alerta por ID
  7. obterContadores() — Contagem de alertas ativos e resolvidos
  8. criarDenuncia(alertaId, motivo) — Cria denúncia de alerta
  9. listarAlertasAdmin() — Lista todos os alertas (admin)
  10. listarDenunciasAdmin() — Lista todas as denúncias (admin)
  11. alterarStatusAlerta(alertaId, novoStatus) — Altera status do alerta (admin)
  12. removerAlerta(alertaId) — Remove alerta (admin)
*/
