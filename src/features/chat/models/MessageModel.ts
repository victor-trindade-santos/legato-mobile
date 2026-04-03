/**
 * LEGATO — Message Model
 *
 * Representa uma mensagem individual no chat.
 * Inclui metadados de status (enviando, entregue, lido).
 */

export interface Message {
  id: string;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string; // ISO 8601 (ex: "2026-04-02T14:32:00Z")
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isMine: boolean; // True se foi enviado por mim
}

/**
 * DTOs que vêm do backend (para serialização/deserialização)
 */
export interface MessageDTO {
  id: string;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: string;
}

/**
 * Payload que enviamos ao backend via WebSocket
 * (quando enviamos uma mensagem nova)
 */
export interface SendMessagePayload {
  receiverId: number;
  content: string;
}

/**
 * Payload que recebemos do backend via WebSocket
 * (quando alguém envia mensagem pra gente)
 */
export interface ReceiveMessagePayload {
  id: string;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

/**
 * Payload para eventos de digitação via WebSocket
 * (quando alguém está digitando no chat)
 */
export interface TypingEventPayload {
  conversationId: number;
  senderId: number;
  senderName: string;
}

/**
 * ════════════════════════════════════════════════════════════════════
 * VIEWMODEL INTERFACE
 * ════════════════════════════════════════════════════════════════════
 *
 * Retorno do hook `useChatViewModel(conversationId)`
 * Agrupa todo o estado e ações necessárias para a View (ChatScreen)
 */

export interface ChatViewModelReturn {
  // ──── STATE ─────────────────────────────────────────
  /** Lista de mensagens da conversa atual (do store) */
  messages: Message[];

  /** Status da conexão WebSocket */
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

  /** Flag de carregamento do histórico HTTP */
  isLoadingMessages: boolean;

  /** Lista de usuários que estão digitando (nomes) */
  typingUsers: string[];

  /** Array de mensagens de erro (auto-limpas após 5s) */
  errors: string[];

  /** Estado atual do input (texto digitado) */
  inputValue: string;

  /** Flag indicando se está enviando mensagem */
  isSending: boolean;

  // ──── HANDLERS ──────────────────────────────────────
  /** Atualiza o texto do input quando usuário digita */
  onInputChange: (text: string) => void;

  /** Envia mensagem com o conteúdo atual do input */
  sendMessage: () => Promise<void>;

  /** Marca conversa como lida no backend (HTTP) */
  markAsRead: () => Promise<void>;

  /** Reconecta ao WebSocket se desconectado */
  retry: () => Promise<void>;
}

