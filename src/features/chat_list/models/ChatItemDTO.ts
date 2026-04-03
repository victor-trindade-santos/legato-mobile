/**
 * LEGATO — Chat Item DTO
 *
 * Modelo principal de uma conversa 1-to-1.
 * Usado tanto na lista de chats quanto para abrir um chat específico.
 * Contém informações resumidas + metadados da conversa.
 */

export interface ChatItemDTO {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserProfilePictureUrl?: string;
  lastMessageContent?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}