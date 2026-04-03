/**
 * LEGATO — Chat HTTP Service
 *
 * Responsabilidade: Comunicação REST com backend
 * (Histórico de mensagens de UMA conversa específica)
 *
 * ⚠️ IMPORTANTE:
 * - Usa HTTP (REST), não WebSocket
 * - Apenas LEITURA (GET requests)
 * - Para ENVIAR mensagens, use WebSocketService
 * - Para LISTA DE CONVERSAS, use chatListService
 * - Dados vêm do BANCO DE DADOS (histórico persistido)
 *
 * USO:
 *   const service = chatService;
 *   const messages = await service.fetchMessages(conversationId);
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { ChatItemDTO } from '@/features/chat_list/models/ChatItemDTO';
import type { Message } from '@/features/chat/models/MessageModel';

export class ChatService {
  /**
   * Busca histórico de mensagens de uma conversa
   *
   * @param conversationId ID da conversa
   * @param limit Limite de mensagens (padrão: 50)
   * @param offset Para paginação (padrão: 0)
   * @returns Array de mensagens antigas (histórico do BD)
   * @throws Error se falhar
   *
   * Exemplo de resposta:
   * [
   *   {
   *     id: "msg-1",
   *     conversationId: "conv-1",
   *     senderId: 1,
   *     senderName: "João",
   *     content: "Primeiro olá",
   *     timestamp: "2026-04-01T10:00:00Z",
   *     status: "delivered",
   *     isMine: true,
   *   },
   *   {
   *     id: "msg-2",
   *     conversationId: "conv-1",
   *     senderId: 2,
   *     senderName: "Maria",
   *     content: "Oi João!",
   *     timestamp: "2026-04-01T10:01:00Z",
   *     status: "delivered",
   *     isMine: false,
   *   },
   *   ...
   * ]
   */
  async fetchMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      console.log('[ChatService] Buscando histórico de mensagens:', {
        conversationId,
        limit,
        offset,
      });

      const response = await api.get<Message[]>(
        Endpoints.chat.messages(conversationId),
        {
          params: {
            limit,
            offset,
          },
        }
      );

      console.log(
        '[ChatService] Histórico carregado:',
        response.data.length,
        'mensagens'
      );
      return response.data;
    } catch (error) {
      console.error('[ChatService] Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  /**
   * Busca detalhes de uma conversa específica
   *
   * @param conversationId ID da conversa
   * @returns Dados da conversa (sem histórico de msgs)
   * @throws Error se falhar
   */
  async getConversationDetails(conversationId: number): Promise<ChatItemDTO> {
    try {
      console.log('[ChatService] Buscando detalhes da conversa:', conversationId);

      const response = await api.get<ChatItemDTO>(
        Endpoints.chat.getById(conversationId)
      );

      console.log('[ChatService] Detalhes carregados:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ChatService] Erro ao buscar detalhes:', error);
      throw error;
    }
  }

  /**
   * Marca mensagens como lidas
   *
   * @param conversationId ID da conversa
   * @returns Sucesso
   */
  async markAsRead(conversationId: number): Promise<void> {
    try {
      console.log('[ChatService] Marcando como lida:', conversationId);

      await api.post(`${Endpoints.chat.conversations}/read`, {
        conversationId,
      });

      console.log('[ChatService] Marcado como lido');
    } catch (error) {
      console.error('[ChatService] Erro ao marcar como lido:', error);
      throw error;
    }
  }
}

/**
 * Singleton da instância
 * Use: const service = ChatService.getInstance();
 */
let instance: ChatService | null = null;

export function createChatService(): ChatService {
  if (!instance) {
    instance = new ChatService();
  }
  return instance;
}

export const chatService = createChatService();
