/**
 * LEGATO — useChatMessages Hook
 *
 * Hook otimizado para acessar APENAS mensagens do ChatStore
 * Re-renda APENAS quando messages mudam (performance)
 *
 * USO:
 *   const messages = useChatMessages();
 */

import { useChatStore } from '@/store/chatStore';

export const useChatMessages = () =>
  useChatStore((state) => state.messages);
