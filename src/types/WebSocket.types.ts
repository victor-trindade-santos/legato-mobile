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

// Formato da mensagem recebida via WebSocket (STOMP)
export interface IncomingWSMessage {
  id: number;
  senderName: string;
  senderEmail: string;
  content: string;
  timestamp: string; // "DD/MM/YYYY HH:MM"
}

// Formato do payload enviado para o servidor
export interface OutgoingWSMessage {
  receiver: {
    id: number;
  };
  content: string;
}

// Callback chamado quando uma nova mensagem é recebida via WebSocket
export type MessageHandler = (message: IncomingWSMessage) => void;