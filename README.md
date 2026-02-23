# 🐾 PataAlerta

**Plataforma comunitária gratuita de alertas de animais perdidos, encontrados e para doação.**

## Sobre

PataAlerta ajuda moradores de cidades pequenas a registrar e encontrar animais perdidos em menos de 2 minutos. 100% gratuito, sem login, com contato direto via WhatsApp.

## Funcionalidades

- Registrar alertas (perdido / encontrado / doação) com foto, descrição e localização
- Listar alertas com filtros por tipo, espécie e bairro
- Contato direto via WhatsApp
- Compartilhamento viral (WhatsApp + copiar link)
- Expiração automática de alertas (30 dias)
- Denúncia de alertas suspeitos
- Painel admin para moderação

## Stack

- **Front-end:** HTML5 + CSS3 + JavaScript ES6+ (Vanilla)
- **Back-end:** Firebase Firestore + Storage (plano gratuito)
- **Hospedagem:** GitHub Pages
- **CI/CD:** GitHub Actions

## Configuração

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Firestore e Storage
3. Copie as credenciais do projeto
4. Cole em `js/firebase-config.js`
5. Configure as Security Rules (Firestore e Storage)
6. Faça push para a branch `main` — o deploy é automático

## Estrutura

```
pataalerta/
├── index.html
├── css/style.css
├── js/
│   ├── app.js
│   ├── firebase-config.js
│   ├── db.js
│   ├── storage.js
│   ├── ui.js
│   ├── filters.js
│   ├── utils.js
│   └── admin.js
├── img/
│   ├── logo.svg
│   └── placeholder.svg
├── .github/workflows/deploy.yml
└── README.md
```

## Licença

Feito com ❤️ para a comunidade.

---

**PataAlerta v0.1.0** — PkacciSystems
