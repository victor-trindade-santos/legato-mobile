/**
 * LEGATO — Chat Item DTO
 *
 * Modelo principal de uma conversa 1-to-1.
 * Usado tanto na lista de chats quanto para abrir um chat específico.
 * Contém informações resumidas + metadados da conversa.
 */

import type { MediaType } from '@/types/WebSocket.types';

export interface ChatItemDTO {
  chatId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserUsername?: string;
  otherUserProfilePictureUrl?: string;
  lastMessageContent?: string;
  lastMessageTimestamp?: string;
  lastMessageTypeMedia?: MediaType;
  isOnline: boolean;
  lastSeen: string | null;
}