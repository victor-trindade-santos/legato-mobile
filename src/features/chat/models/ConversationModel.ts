/**
 * LEGATO — Conversation Model
 *
 * Representa uma conversa (1-to-1) entre dois usuários.
 * Contém referências ao usuário participante e mensagens.
 */

import { Message } from './MessageModel';
import type { ChatItemDTO } from '@/features/chat_list/models/ChatItemDTO';

export interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  statusText?: 'online' | 'offline' | 'away';
}

/**
 * Estado extendido de uma conversa (para quando abrimos o chat)
 * = ChatItemDTO + todas as mensagens historicamente + estado de loading
 */
export interface ConversationWithMessages extends ChatItemDTO {
  messages: Message[];
  isLoadingHistory: boolean;
}
