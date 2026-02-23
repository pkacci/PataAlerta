/* ========== INÍCIO: firebase-config.js | path: pataalerta/js/firebase-config.js ========== */

/**
 * PataAlerta — Configuração Firebase
 * 
 * INSTRUÇÕES:
 * 1. Acesse console.firebase.google.com pelo navegador do celular
 * 2. Abra seu projeto Firebase
 * 3. Vá em Configurações do projeto (ícone engrenagem) > Geral
 * 4. Role até "Seus apps" > Web app (ícone </>)
 * 5. Copie os valores de firebaseConfig e substitua abaixo
 */

const firebaseConfig = {
  apiKey: "AIzaSyChYcCvovxe4k98hn4ue013pBoy4vd0l9E",
  authDomain: "pataalerta-984a4.firebaseapp.com",
  projectId: "pataalerta-984a4",
  storageBucket: "pataalerta-984a4.firebasestorage.app",
  messagingSenderId: "423108927688",
  appId: "1:423108927688:web:5624b16e398397641885fd"
};

/* ---------- Inicialização ---------- */
let app = null;
let db = null;
let storage = null;

/**
 * Inicializa o Firebase e retorna as instâncias
 * @returns {{ app: object, db: object, storage: object }} Instâncias Firebase
 */
function initFirebase() {
  try {
    if (app) {
      return { app, db, storage };
    }

    if (firebaseConfig.apiKey === "SUA_API_KEY_AQUI") {
      console.error(
        "⚠️ PataAlerta: Firebase não configurado!\n" +
        "Abra js/firebase-config.js e substitua os valores de firebaseConfig\n" +
        "com as credenciais do seu projeto Firebase."
      );
      return { app: null, db: null, storage: null };
    }

    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();

    console.log("✅ Firebase inicializado com sucesso");

    return { app, db, storage };
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
    return { app: null, db: null, storage: null };
  }
}

/**
 * Retorna a instância do Firestore
 * @returns {object|null} Instância Firestore
 */
function getDb() {
  return db;
}

/**
 * Retorna a instância do Storage
 * @returns {object|null} Instância Storage
 */
function getStorage() {
  return storage;
}

/**
 * Verifica se o Firebase está configurado e inicializado
 * @returns {boolean}
 */
function isFirebaseReady() {
  return app !== null && db !== null && storage !== null;
}

/* ========== FIM: firebase-config.js | path: pataalerta/js/firebase-config.js ========== */

/*
  LISTA DE FUNÇÕES PRESENTES:
  1. initFirebase() — Inicializa Firebase app, Firestore e Storage
  2. getDb() — Retorna instância do Firestore
  3. getStorage() — Retorna instância do Storage
  4. isFirebaseReady() — Verifica se Firebase está pronto
*/
