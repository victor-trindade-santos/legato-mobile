/**
 * LEGATO — useChatConnectionStatus Hook
 *
 * Hook otimizado para acessar APENAS status de conexão WebSocket
 * Re-renda APENAS quando connectionStatus muda
 *
 * USO:
 *   const status = useChatConnectionStatus();
 *   if (status === 'connected') { ... }
 */

import { useChatStore } from '@/store/chatStore';

export const useChatConnectionStatus = () =>
  useChatStore((state) => state.connectionStatus);
