/**
 * LEGATO — WebSocket Payload Models
 *
 * Tipos genéricos para comunicação STOMP (WebSocket).
 * Define estrutura de frames que entram/saem do servidor.
 */

/**
 * Frame genérico para qualquer mensagem STOMP
 * (usado internamente pelo StompJS)
 */
export interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Configuração de conexão STOMP
 */
export interface StompConnectConfig {
  url: string;
  headers?: {
    Authorization: string;
    'X-User-ID'?: string;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (error: string | StompFrame) => void;
  reconnectDelay?: number;
}

/**
 * Tipos de eventos que podem chegar via WebSocket
 */
export type WebSocketEventType = 'message' | 'typing' | 'status' | 'error';

/**
 * Evento genérico que dispara internamente
 */
export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
}

/**
 * Configuração de subscrição a um tópico/fila
 */
export interface SubscriptionConfig {
  destination: string; // ex: "/user/queue/messages" ou "/topic/group-123"
  id: string; // identificador único da subscrição
  onMessage: (payload: any) => void;
  onError?: (error: any) => void;
}

/**
 * Estados da conexão WebSocket
 */
export type WebSocketConnectionStatus = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';
