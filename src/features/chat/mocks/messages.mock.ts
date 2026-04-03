/**
 * Mock de mensagens de chat para desenvolvimento local.
 * Usado pelo ChatService quando DEV_USE_MOCK=true.
 */

import type { Message } from '../models/MessageModel';

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
const fiftyMinAgo = new Date(now.getTime() - 50 * 60 * 1000).toISOString();
const fortyMinAgo = new Date(now.getTime() - 40 * 60 * 1000).toISOString();
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();
const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

/**
 * Mensagens mock para conversa com ID 1 (John Doe)
 */
export const mockMessagesConversation1: Message[] = [
  {
    id: 'msg-1',
    conversationId: 1,
    senderId: 101,
    senderName: 'John Doe',
    senderAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'Oi! Como você está?',
    timestamp: oneHourAgo,
    status: 'read',
    isMine: false,
  },
  {
    id: 'msg-2',
    conversationId: 1,
    senderId: 1, // Seu ID (mimic do AuthStore)
    senderName: 'Você',
    senderAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'Tudo bem! E você?',
    timestamp: fiftyMinAgo,
    status: 'read',
    isMine: true,
  },
  {
    id: 'msg-3',
    conversationId: 1,
    senderId: 101,
    senderName: 'John Doe',
    senderAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'Estou ótimo! Vamos conversar?',
    timestamp: fortyMinAgo,
    status: 'delivered',
    isMine: false,
  },
  {
    id: 'msg-4',
    conversationId: 1,
    senderId: 1,
    senderName: 'Você',
    senderAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'Claro! Do que você quer conversar?',
    timestamp: thirtyMinAgo,
    status: 'sent',
    isMine: true,
  },
  {
    id: 'msg-5',
    conversationId: 1,
    senderId: 101,
    senderName: 'John Doe',
    senderAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'Sobre aquele projeto que mencionei...',
    timestamp: twentyMinAgo,
    status: 'sent',
    isMine: false,
  },
  {
    id: 'msg-6',
    conversationId: 1,
    senderId: 1,
    senderName: 'Você',
    senderAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'Ah sim! Vamos marcar uma reunião?',
    timestamp: fiveMinAgo,
    status: 'sent',
    isMine: true,
  },
];

// Helper: retorna mensagens mockadas por conversationId
export function getMockMessages(conversationId: number): Message[] {
  switch (conversationId) {
    case 1:
      return mockMessagesConversation1;
    default:
      return [];
  }
}
