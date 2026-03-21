/** Todas as URLs da API centralizadas — nunca escreva strings de rota espalhadas */

import { ChatListItem } from "@/components/molecules/ChatListItem/ChatListItem";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const Endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
  },

  // Usuários
  users: {
    getByUsername: (username: string) => `/users/${username}`,
    update: '/users/me',
    follow: (id: number) => `/users/${id}/follow`,
    unfollow: (id: number) => `/users/${id}/unfollow`,
    suggested: '/users/suggested',
  },

  // Descoberta
  discovery: {
    musicians: '/discovery/musicians',
    swipe: '/discovery/swipe',
    filters: '/discovery/filters',
  },

  // Conexões
  connections: {
    list: '/connections',
    accept: (id: number) => `/connections/${id}/accept`,
    decline: (id: number) => `/connections/${id}/decline`,
    pending: '/connections/pending',
  },

  // Notificações
  notifications: {
    list: '/notifications',
    markRead: (id: number) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    unreadCount: '/notifications/unread-count',
  },

  // Feed / Posts
  posts: {
    feed: '/posts/feed',
    create: '/posts',
    getById: (id: number) => `/posts/${id}`,
    like: (id: number) => `/posts/${id}/like`,
    comment: (id: number) => `/posts/${id}/comments`,
  },

  // Colaborações / JAMs
  collaborations: {
    list: '/collaborations',
    create: '/collaborations',
    getById: (id: number) => `/collaborations/${id}`,
  },

  // Chat
  chat: {
    conversations: '/chat/conversations',
    messages: (conversationId: number) => `/chat/conversations/${conversationId}/messages`,
  },

  //Chat List
  chatListItem:{
    list: '/chat-list',
    getById: (id: number) => `/chat/conversations/${id}`,
  },

  // Busca
  search: {
    query: '/search',
  },
} as const;
