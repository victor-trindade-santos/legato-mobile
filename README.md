# Legato Mobile

App mobile para músicos — React Native + Expo.

---

## Pré-requisitos

- Node.js 18+
- [Expo Go](https://expo.dev/go) no celular **ou** emulador Android (Android Studio)
- Conta em [expo.dev](https://expo.dev) com acesso ao projeto `@victor20021110/legato-mobile`

---

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo `.env` na raiz do projeto

```env
EXPO_PUBLIC_API_URL=https://legato-mobile-backend.onrender.com
EXPO_PUBLIC_WS_URL=wss://legato-mobile-backend.onrender.com/ws
```

> O prefixo `EXPO_PUBLIC_` é obrigatório — Expo só expõe variáveis com esse prefixo para o app.

### 3. Iniciar o projeto

```bash
npm start
```

Escaneie o QR code com o Expo Go ou pressione `a` para abrir no emulador Android.

---

## Apontando para backend local

Em `src/constants/config.ts`, altere a flag:

```ts
const DEV_USE_LOCAL_BACKEND = true;
```

| Plataforma | Variável no `.env` | Valor |
|---|---|---|
| Emulador Android | `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:8082` |
| Celular físico (Wi-Fi) | `EXPO_PUBLIC_API_URL` | `http://192.168.x.x:8082` |
| Browser/web | `EXPO_PUBLIC_LOCAL_API_URL` | `http://localhost:8082` |

O mesmo padrão vale para as variáveis `WS_URL`. Lembre de voltar `DEV_USE_LOCAL_BACKEND = false` antes de commitar.

---

## Flags de desenvolvimento

Também em `src/constants/config.ts`:

| Flag | Efeito quando `true` |
|---|---|
| `DEV_BYPASS_AUTH` | Pula o login e entra direto no app |
| `DEV_USE_MOCK` | Usa dados mock no Chat List (sem backend) |
| `DEV_DISABLE_WEBSOCKET` | Desabilita WebSocket (mensagens em tempo real param) |

> Não commite essas flags como `true`.

---

## Build (APK)

Requer EAS CLI instalado e login feito:

```bash
npm install -g eas-cli
eas login
```

### EM SEGUIDA EXECUTE ISSO -> Gerar APK para testes

```bash
npm run build:preview
```

Esse comando:
1. Incrementa automaticamente a versão patch em `app.json` (`1.0.0 → 1.0.1`)
2. Envia o projeto para compilação na nuvem via EAS
3. Disponibiliza o link de download do `.apk` no terminal ao finalizar

Acompanhe em: [expo.dev → builds](https://expo.dev/accounts/victor20021110/projects/legato-mobile/builds)

### Gerar AAB para Play Store

```bash
npm run build:production
```

### Versionamento

| Tipo | O que fazer |
|---|---|
| Patch (ajuste/bug fix) | `npm run build:preview` — incrementa sozinho |
| Minor (nova funcionalidade) | Edite `version` no `app.json` para `1.1.0` e builde |
| Major (mudança grande) | Edite `version` no `app.json` para `2.0.0` e builde |

### Primeira build em uma máquina nova

O EAS vai perguntar uma única vez:

- **Vincular ao projeto** → confirme com `yes`
- **Android application id** → `com.victor20021110.legatomobile`
- **Keystore** → use as credenciais remotas do servidor Expo

Nos builds seguintes, nenhuma interação é necessária.

---

## Observações

- **Render (plano gratuito):** o servidor hiberna após inatividade. A primeira requisição pode demorar até 60 segundos para acordar.
