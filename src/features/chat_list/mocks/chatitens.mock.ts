/**
 * Mock de itens de chat para desenvolvimento local.
 * Usado pelo chatListService quando DEV_USE_MOCK=true.
 */

import type { ChatItemDTO } from '../models/ChatItemDTO';

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

export const mockChatItems: ChatItemDTO[] = [
  {
    id: 1,
    otherUserId: 101,
    otherUserName: 'John Doe',
    otherUserProfilePictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessageContent: 'Olá, como você está?',
    lastMessageTimestamp: oneHourAgo,
    unreadCount: 0,
    createdAt: twoDaysAgo,
    updatedAt: oneHourAgo,
  },
  {
    id: 2,
    otherUserId: 102,
    otherUserName: 'Jane Smith',
    otherUserProfilePictureUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessageContent: 'Vamos marcar uma reunião?',
    lastMessageTimestamp: yesterday,
    unreadCount: 2,
    createdAt: twoDaysAgo,
    updatedAt: yesterday,
  },
  {
    id: 3,
    otherUserId: 103,
    otherUserName: 'Carlos Silva',
    otherUserProfilePictureUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastMessageContent: 'Enviei o arquivo solicitado.',
    lastMessageTimestamp: twoDaysAgo,
    unreadCount: 0,
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: 4,
    otherUserId: 104,
    otherUserName: 'Maria Oliveira',
    otherUserProfilePictureUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    lastMessageContent: 'Obrigado pela ajuda!',
    lastMessageTimestamp: thirtyMinAgo,
    unreadCount: 1,
    createdAt: twoDaysAgo,
    updatedAt: thirtyMinAgo,
  },
];