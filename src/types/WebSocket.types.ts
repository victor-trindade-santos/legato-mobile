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
// Espelha o ChatMessageDTO do backend
export interface IncomingWSMessage {
  id: number;
  chatId: number;
  senderName: string;
  senderEmail: string;
  content: string;
  timestamp: string; // "DD/MM/YYYY HH:MM"
  typeMedia?: 'NONE' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  mediaUrl?: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  repliedMessage?: Pick<IncomingWSMessage, 'id' | 'content' | 'senderName'>;
}

// Callback chamado quando uma nova mensagem é recebida via WebSocket
export type MessageHandler = (message: IncomingWSMessage) => void;

// Payload de typing recebido/enviado via WebSocket
export interface TypingDTO {
  chatId: number;
  userId: number;
  typing: boolean; // Jackson serializa 'boolean isTyping' como 'typing' (strips prefixo 'is')
}

// Callback chamado quando um evento de typing chega via WebSocket
export type TypingHandler = (dto: TypingDTO) => void;