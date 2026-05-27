/**
 * LEGATO — Message Model
 *
 * Representa uma mensagem individual no chat.
 * É essa interface que a View (ChatScreen) consome para renderizar as mensagens.
 */

import type { MediaType } from '@/types/WebSocket.types';

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderName: string;
  isMine: boolean;
  typeMedia?: MediaType;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  thumbnailUrl?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  audioType?: 'voice' | 'audio_file';
}

/**
 * DTO que vem do backend ao buscar histórico (HTTP GET)
 *
 * Exemplo:
 * {
 *   id: 1,
 *   content: "Oi, tudo bem?",
 *   timestamp: "28/03/2026 05:09",
 *   senderName: "username",
 *   senderEmail: "email@gmail.com"
 * }
 */
export interface MessageHistoryDTO {
  id: number;
  content: string;
  timestamp: string; // Formato: "dd/mm/yyyy HH:mm"
  senderName: string;
  senderEmail: string;
  senderId?: number;
  typeMedia?: MediaType;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  thumbnailUrl?: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  audioType?: 'voice' | 'audio_file';
}
