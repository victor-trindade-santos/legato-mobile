/**
 * LEGATO — Chat Store (Zustand)
 *
 * Estado global de chat em tempo real.
 * Armazena em memória:
 * - Mensagens da conversa atual
 * - Lista de conversas
 * - Status de conexão WebSocket
 * - Usuários digitando
 *
 * USO:
 *   const { messages, sendMessage, connectionStatus } = useChatStore();
 */

import { create } from 'zustand';
import type { Message } from '@/features/chat/models/MessageModel';
import type { ChatItemDTO } from '@/features/chat_list/models/ChatItemDTO';
import type { WebSocketConnectionStatus } from '@/types/WebSocket.types';

interface ChatState {
  // ════════════════════════════════════════════════════════
  // STATE — Dados em memória
  // ════════════════════════════════════════════════════════

  /** Lista de todas as conversas do usuário */
  conversations: ChatItemDTO[];

  /** ID da conversa atualmente aberta */
  currentConversationId: number | null;

  /** Mensagens da conversa atual */
  messages: Message[];

  /** Status da conexão WebSocket */
  connectionStatus: WebSocketConnectionStatus;

  /** IDs dos usuários que estão digitando */
  typingUsers: string[];

  /** Mensagens de erro acumuladas */
  errors: string[];

  /** Se está carregando mensagens do histórico */
  isLoadingMessages: boolean;

  /** Se está carregando lista de conversas */
  isLoadingConversations: boolean;

  // ════════════════════════════════════════════════════════
  // ACTIONS — Métodos para atualizar o estado
  // ════════════════════════════════════════════════════════

  /**
   * Define a lista de conversas
   */
  setConversations: (conversations: ChatItemDTO[]) => void;

  /**
   * Abre uma conversa específica
   */
  setCurrentConversation: (conversationId: number) => void;

  /**
   * Carrega histórico de mensagens para converter atual
   */
  setMessages: (messages: Message[]) => void;

  /**
   * Adiciona uma nova mensagem ao chat
   * (chamado quando msg chega via WebSocket)
   */
  addMessage: (message: Message) => void;

  /**
   * Atualiza status de uma mensagem
   * (ex: sending → sent → delivered → read)
   */
  updateMessageStatus: (messageId: string, status: Message['status']) => void;

  /**
   * Atualiza mensagem temporária com ID real do backend
   * (quando criamos com ID temp e depois backend retorna ID real)
   */
  updateMessageId: (tempId: string, realId: string) => void;

  /**
   * Atualiza status de conexão
   * (chamado pelo WebSocketService quando chega evento)
   */
  setConnectionStatus: (status: WebSocketConnectionStatus) => void;

  /**
   * Define quem está digitando
   */
  setTypingUsers: (userIds: string[]) => void;

  /**
   * Adiciona erro à lista
   */
  addError: (error: string) => void;

  /**
   * Limpa lista de erros
   */
  clearErrors: () => void;

  /**
   * Define flag de loading de mensagens
   */
  setLoadingMessages: (loading: boolean) => void;

  /**
   * Define flag de loading de conversas
   */
  setLoadingConversations: (loading: boolean) => void;

  /**
   * Atualiza última mensagem de uma conversa
   * (chamado quando nova msg chega e queremos sincronizar a lista)
   */
  updateConversationLastMessage: (
    conversationId: number,
    lastMessageContent: string,
    lastMessageTimestamp: string
  ) => void;

  /**
   * Limpa tudo (logout, etc)
   */
  reset: () => void;
}

const initialState = {
  conversations: [],
  currentConversationId: null,
  messages: [],
  connectionStatus: 'disconnected' as WebSocketConnectionStatus,
  typingUsers: [],
  errors: [],
  isLoadingMessages: false,
  isLoadingConversations: false,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  // ════════════════════════════════════════════════════════
  // SETTERS SIMPLES
  // ════════════════════════════════════════════════════════

  setConversations: (conversations) =>
    set({
      conversations,
      isLoadingConversations: false,
    }),

  setCurrentConversation: (conversationId) =>
    set({
      currentConversationId: conversationId,
      messages: [], // Limpa mensagens anteriores
    }),

  setMessages: (messages) =>
    set({
      messages,
      isLoadingMessages: false,
    }),

  setConnectionStatus: (status) => {
    console.log('[ChatStore] Status atualizado:', status);
    set({ connectionStatus: status });
  },

  setTypingUsers: (userIds) =>
    set({ typingUsers: userIds }),

  addError: (error) => {
    const current = get().errors;
    set({ errors: [...current, error] });
    // Remove erro após 5 segundos
    setTimeout(() => {
      const updated = get().errors.filter((e) => e !== error);
      set({ errors: updated });
    }, 5000);
  },

  clearErrors: () =>
    set({ errors: [] }),

  setLoadingMessages: (loading) =>
    set({ isLoadingMessages: loading }),

  setLoadingConversations: (loading) =>
    set({ isLoadingConversations: loading }),

  // ════════════════════════════════════════════════════════
  // LÓGICA DE MENSAGENS
  // ════════════════════════════════════════════════════════

  addMessage: (message) => {
    const current = get().messages;

    // Não duplica se mensagem já existe
    const exists = current.some((m) => m.id === message.id);
    if (exists) {
      console.warn('[ChatStore] Mensagem duplicada:', message.id);
      return;
    }

    // Adiciona ao final
    set({
      messages: [...current, message],
    });

    console.log('[ChatStore] Mensagem adicionada:', message.id);
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));

    console.log('[ChatStore] Status atualizado:', { messageId, status });
  },

  updateMessageId: (tempId, realId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === tempId ? { ...msg, id: realId } : msg
      ),
    }));

    console.log('[ChatStore] ID atualizado:', { tempId, realId });
  },

  updateConversationLastMessage: (conversationId, lastMessageContent, lastMessageTimestamp) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, lastMessageContent, lastMessageTimestamp }
          : conv
      ),
    }));

    console.log('[ChatStore] Conversa atualizada:', {
      conversationId,
      lastMessageContent,
    });
  },

  // ════════════════════════════════════════════════════════
  // RESET
  // ════════════════════════════════════════════════════════

  reset: () => {
    set(initialState);
    console.log('[ChatStore] Reset para estado inicial');
  },
}));
