/**
 * LEGATO — Configurações Globais
 * Altere API_URL conforme ambiente (dev/prod).
 */

export const Config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL ?? 'ws://10.0.2.2:8080/ws',
  APP_VERSION: '1.0.0',
  TOKEN_KEY: 'legato_jwt_token',

  /**
   * DEV: define true para pular a autenticação e entrar direto no app.
   * Lembre de voltar para false antes de commitar.
   */
  DEV_BYPASS_AUTH: true,

  /**
   * DEV: define true para usar dados mock na tela de Chat List (sem backend).
   * Lembre de voltar para false antes de commitar.
   */
  DEV_USE_MOCK: true,

  /**
   * DEV: define true para desabilitar WebSocket durante desenvolvimento.
   * Mensagens em tempo real não funcionarão, mas lista de chats vai funcionar.
   * Lembre de voltar para false antes de commitar.
   */
  DEV_DISABLE_WEBSOCKET: false,
} as const;
