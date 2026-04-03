/**
 * LEGATO — useChatViewModel Hook
 *
 * ViewModel que orquestra:
 * - WebSocketService (tempo real)
 * - ChatService (histórico HTTP)
 * - ChatStore (estado em memória)
 *
 * Responsabilidades:
 * 1. Conectar ao WebSocket
 * 2. Carregar histórico de mensagens
 * 3. Escutar mensagens em tempo real
 * 4. Gerenciar ações (enviar, digitar, etc)
 * 5. Sincronizar lista de conversas
 *
 * USO:
 *   const viewModel = useChatViewModel(conversationId);
 *   return (
 *     <View>
 *       <FlatList data={viewModel.messages} />
 *       <ChatInputBar onSend={viewModel.sendMessage} />
 *     </View>
 *   );
 */

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useChatMessages, useChatConnectionStatus } from '@/hooks';
import { WebSocketService } from '@/services/websocket/WebSocketService';
import { chatService } from '@/features/chat/services/ChatService';
import type {
  Message,
  SendMessagePayload,
  TypingEventPayload,
  ChatViewModelReturn,
} from '@/features/chat/models/MessageModel';

export function useChatViewModel(conversationId: number): ChatViewModelReturn {
  const user = useAuthStore((state) => state.user);
  const chatStore = useChatStore();

  // Hooks otimizados (re-render apenas se mudar)
  const messages = useChatMessages();
  const connectionStatus = useChatConnectionStatus();
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const typingUsers = useChatStore((state) => state.typingUsers);
  const errors = useChatStore((state) => state.errors);

  // ════════════════════════════════════════════════════════
  // STATE DO INPUT (local ao hook, não global)
  // ════════════════════════════════════════════════════════
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Ref para rastrear subscrições (cleanup)
  const subscriptionsRef = useRef<string[]>([]);
  const statusUnsubscribeRef = useRef<(() => void) | null>(null);
  const errorUnsubscribeRef = useRef<(() => void) | null>(null);

  // ════════════════════════════════════════════════════════════════════
  // 1️⃣ SETUP INICIAL & CLEANUP
  // ════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!user || !conversationId) return;

    let isMounted = true;

    const setupChat = async () => {
      try {
        // 1. Atualiza conversa atual no store
        chatStore.setCurrentConversation(conversationId);
        chatStore.setLoadingMessages(true);

        console.log('[ViewModel] Abrindo chat:', conversationId);

        // ─────────────────────────────────────────────────────────────
        // 2. Carrega histórico de mensagens via HTTP
        // ─────────────────────────────────────────────────────────────
        try {
          const historicalMessages = await chatService.fetchMessages(conversationId);
          if (isMounted) {
            chatStore.setMessages(historicalMessages);
          }
        } catch (error) {
          console.error('[ViewModel] Erro ao carregar histórico:', error);
          chatStore.addError('Erro ao carregar histórico de mensagens');
        }

        // ─────────────────────────────────────────────────────────────
        // 3. Conecta ao WebSocket (se não estiver já)
        // ─────────────────────────────────────────────────────────────
        if (connectionStatus === 'disconnected' || connectionStatus === 'idle') {
          try {
            await WebSocketService.connect();
          } catch (error) {
            console.error('[ViewModel] Erro ao conectar WebSocket:', error);
            chatStore.addError('Erro ao conectar ao servidor');
          }
        }

        // ─────────────────────────────────────────────────────────────
        // 4. Escuta mudanças de status da conexão
        // ─────────────────────────────────────────────────────────────
        if (isMounted) {
          statusUnsubscribeRef.current = WebSocketService.onStatusChange((status) => {
            chatStore.setConnectionStatus(status);
          });

          errorUnsubscribeRef.current = WebSocketService.onError((error) => {
            chatStore.addError(error);
          });
        }

        // ─────────────────────────────────────────────────────────────
        // 5. Subscreve a mensagens em tempo real
        // ─────────────────────────────────────────────────────────────
        if (isMounted) {
          const messageSubId = WebSocketService.subscribe(
            '/user/queue/messages',
            (payload) => {
              // Mensagem recebida via WebSocket

              // Se é pra esta conversa
              if (payload.conversationId === conversationId) {
                const newMessage: Message = {
                  id: payload.id,
                  conversationId: payload.conversationId,
                  senderId: payload.senderId,
                  senderName: payload.senderName,
                  senderAvatar: payload.senderAvatar,
                  content: payload.content,
                  timestamp: payload.timestamp,
                  status: 'delivered',
                  isMine: payload.senderId === user?.id,
                };

                // Adiciona ao chat aberto
                chatStore.addMessage(newMessage);

                // Sincroniza última mensagem na lista de conversas
                chatStore.updateConversationLastMessage(
                  conversationId,
                  payload.content,
                  payload.timestamp
                );
              } else {
                // Se é pra outra conversa, só sincroniza a lista
                chatStore.updateConversationLastMessage(
                  payload.conversationId,
                  payload.content,
                  payload.timestamp
                );
              }
            }
          );

          subscriptionsRef.current.push(messageSubId);
        }

        // ─────────────────────────────────────────────────────────────
        // 6. Subscreve a eventos de digitação
        // ─────────────────────────────────────────────────────────────
        if (isMounted) {
          const typingSubId = WebSocketService.subscribe(
            `/topic/typing/${conversationId}`,
            (event: TypingEventPayload) => {
              // event = { conversationId, senderId, senderName }
              chatStore.setTypingUsers([event.senderName]);

              // Remove após 3s de inatividade
              setTimeout(() => {
                chatStore.setTypingUsers([]);
              }, 3000);
            }
          );

          subscriptionsRef.current.push(typingSubId);
        }

        console.log('[ViewModel] Chat setup completo');
      } catch (error) {
        console.error('[ViewModel] Erro no setup:', error);
      }
    };

    setupChat();

    // ════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ════════════════════════════════════════════════════════════════════

    return () => {
      isMounted = false;

      // Remove subscrições
      subscriptionsRef.current.forEach((subId) => {
        WebSocketService.unsubscribe(subId);
      });
      subscriptionsRef.current = [];

      // Remove listeners de status e erro
      if (statusUnsubscribeRef.current) {
        statusUnsubscribeRef.current();
      }
      if (errorUnsubscribeRef.current) {
        errorUnsubscribeRef.current();
      }

      console.log('[ViewModel] Chat cleanup');
    };
  }, [conversationId, user?.id, connectionStatus]);

  // ════════════════════════════════════════════════════════════════════
  // 2️⃣ AÇÕES
  // ════════════════════════════════════════════════════════════════════

  /**
   * Envia uma mensagem
   * 1. Cria msg temporária com status "sending"
   * 2. Adiciona ao store (otimismo)
   * 3. Envia via WebSocket
   * 4. Backend retorna ID real + atualiza status
   */
  const sendMessage = async (): Promise<void> => {
    if (!user || !inputValue.trim()) {
      return;
    }

    setIsSending(true);

    try {
      const content = inputValue.trim();

      // 1. Cria msg temporária
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        conversationId,
        senderId: user.id,
        senderName: user.displayName,
        senderAvatar: user.avatarUrl,
        content,
        timestamp: new Date().toISOString(),
        status: 'sending',
        isMine: true,
      };

      // 2. Adiciona ao store (IMEDIATO - otimismo!)
      chatStore.addMessage(tempMessage);

      // 3. Limpa input imediatamente
      setInputValue('');

      // 4. Envia via WebSocket
      const payload: SendMessagePayload = {
        receiverId: chatStore.currentConversationId as number,
        content,
      };

      WebSocketService.send(payload);

      console.log('[ViewModel] Mensagem enviada:', tempId);
    } catch (error) {
      console.error('[ViewModel] Erro ao enviar mensagem:', error);
      chatStore.addError('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Atualiza o texto do input
   */
  const onInputChange = (text: string): void => {
    setInputValue(text);
  };

  /**
   * Tenta recarregar histórico e reconectar
   */
  const retry = async (): Promise<void> => {
    try {
      console.log('[ViewModel] Tentando reconectar...');
      chatStore.setLoadingMessages(true);

      // Recarrega histórico
      const messages = await chatService.fetchMessages(conversationId);
      chatStore.setMessages(messages);

      // Reconecta WebSocket
      await WebSocketService.connect();

      console.log('[ViewModel] Reconexão bem-sucedida');
    } catch (error) {
      console.error('[ViewModel] Erro ao reconectar:', error);
      chatStore.addError('Erro ao reconectar');
    }
  };

  /**
   * Marca conversa como lida
   */
  const markAsRead = async (): Promise<void> => {
    try {
      await chatService.markAsRead(conversationId);
      console.log('[ViewModel] Conversa marcada como lida:', conversationId);
    } catch (error) {
      console.error('[ViewModel] Erro ao marcar como lido:', error);
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // RETURN
  // ════════════════════════════════════════════════════════════════════

  return {
    // STATE
    messages,
    connectionStatus,
    isLoadingMessages,
    typingUsers,
    errors,
    inputValue,
    isSending,

    // HANDLERS
    onInputChange,
    sendMessage,
    retry,
    markAsRead,
  };
}
