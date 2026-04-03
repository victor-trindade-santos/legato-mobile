/**
 * LEGATO — useChatConversations Hook
 *
 * Hook otimizado para acessar APENAS lista de conversas
 * Re-renda APENAS quando conversations muda
 *
 * USO:
 *   const conversations = useChatConversations();
 */

import { useChatStore } from '@/store/chatStore';

export const useChatConversations = () =>
  useChatStore((state) => state.conversations);
