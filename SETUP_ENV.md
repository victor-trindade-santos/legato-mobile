# Configuração do Ambiente — Legato Mobile

## Variáveis de ambiente

O app usa variáveis de ambiente para apontar para o servidor correto.
O arquivo `.env` **não está no repositório** — cada dev precisa criá-lo manualmente.

### 1. Crie o arquivo `.env` na raiz do projeto

```
legato-mobile/
├── .env        ← criar aqui
├── app.json
├── package.json
└── ...
```

Conteúdo do `.env`:

```env
EXPO_PUBLIC_API_URL=https://legato-mobile-backend.onrender.com
EXPO_PUBLIC_WS_URL=wss://legato-mobile-backend.onrender.com/ws
```

> O prefixo `EXPO_PUBLIC_` é obrigatório — Expo só expõe variáveis com esse prefixo para o app.

---

### 2. Ative a integração com o backend em `src/constants/config.ts`

```ts
DEV_BYPASS_AUTH: false,  // faz o login de verdade
DEV_USE_MOCK: false,     // busca músicos reais da API
```

> Lembre de **não commitar** `config.ts` com esses valores alterados —
> volte para `true` ao terminar os testes locais.

---

### 3. Inicie o Expo com cache limpo

```bash
npx expo start --clear
```

---

## Observações

- **Render (plano gratuito):** o servidor entra em sleep após inatividade.
  A primeira requisição pode demorar até 60 segundos para "acordar". É normal.

## Observações para rodar localmente

- **Emulador Android (Android Studio):** use `http://10.0.2.2:8080` para apontar para um servidor rodando localmente na sua máquina. Esse é o valor padrão de `API_URL` quando nenhum `.env` está presente.

- **Dispositivo físico na mesma rede Wi-Fi:** use o IP local da sua máquina, ex: `http://192.168.x.x:8080`.
