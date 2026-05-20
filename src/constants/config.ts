/**
 * LEGATO — Configurações Globais
 * Altere API_URL conforme ambiente (dev/prod).
 */

import { Platform } from 'react-native';

/**
 * DEV_USE_LOCAL_BACKEND: true  → backend local no PC
 *   • web/browser  → localhost (EXPO_PUBLIC_LOCAL_API_URL)
 *   • celular/emu  → IP da rede local (EXPO_PUBLIC_API_URL, ex: 192.168.x.x)
 *                        false → Render/produção (EXPO_PUBLIC_API_URL)
 */
const DEV_USE_LOCAL_BACKEND = false;

const API_URL = DEV_USE_LOCAL_BACKEND
  ? Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_LOCAL_API_URL ?? 'http://localhost:8082')
    : (process.env.EXPO_PUBLIC_API_URL        ?? 'http://10.0.2.2:8082')
  : (process.env.EXPO_PUBLIC_API_URL          ?? 'http://10.0.2.2:8082');

const WS_URL = DEV_USE_LOCAL_BACKEND
  ? Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_LOCAL_WS_URL ?? 'ws://localhost:8082/ws-chat')
    : (process.env.EXPO_PUBLIC_WS_URL        ?? 'ws://10.0.2.2:8082/ws-chat')
  : (process.env.EXPO_PUBLIC_WS_URL          ?? 'ws://10.0.2.2:8082/ws-chat');

export const Config = {
  API_URL,
  WS_URL,
  APP_VERSION: '1.0.0',
  TOKEN_KEY: 'legato_jwt_token',

  /**
   * DEV: define true para pular a autenticação e entrar direto no app.
   * Lembre de voltar para false antes de commitar.
   */
  DEV_BYPASS_AUTH: false,

  /**
   * DEV: define true para usar dados mock na tela de Chat List (sem backend).
   * Lembre de voltar para false antes de commitar.
   */
  DEV_USE_MOCK: false,

  /**
   * DEV: define true para desabilitar WebSocket durante desenvolvimento.
   * Mensagens em tempo real não funcionarão, mas lista de chats vai funcionar.
   * Lembre de voltar para false antes de commitar.
   */
  DEV_DISABLE_WEBSOCKET: false,
} as const;
