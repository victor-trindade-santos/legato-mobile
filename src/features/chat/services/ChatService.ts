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
import type { Message, MessageHistoryDTO } from '@/features/chat/models/MessageModel';
import { mapMessageHistoryDTOToMessage } from '@/features/chat/models/MessageModel';

export class ChatService {
  /**
   * Busca histórico de mensagens de uma conversa
   *
   * @param conversationId ID da conversa
   * @param currentUserEmail Email do usuário atual (para determinar `isMine`)
   * @param limit Limite de mensagens (padrão: 50)
   * @param offset Para paginação (padrão: 0)
   * @returns Array de mensagens antigas (histórico do BD) - convertidas para Message
   * @throws Error se falhar
   *
   * Exemplo de resposta do backend (MessageHistoryDTO[]):
   * [
   *   {
   *     id: 1,
   *     content: "Oi, tudo bem?",
   *     timestamp: "28/03/2026 05:09",
   *     senderName: "victor_test",
   *     senderEmail: "example@gmail.com"
   *   },
   *   {
   *     id: 2,
   *     content: "Tudo sim! E você?",
   *     timestamp: "28/03/2026 05:10",
   *     senderName: "gabriel",
   *     senderEmail: "gabriel"
   *   }
   * ]
   */
  async fetchMessages(
    conversationId: number,
    currentUserEmail: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      console.log('[ChatService] Buscando histórico de mensagens:', {
        conversationId,
        limit,
        offset,
      });

      const response = await api.get<MessageHistoryDTO[]>(
        Endpoints.chat.messages(conversationId),
        {
          params: {
            limit,
            offset,
          },
        }
      );

      // Mapeia MessageHistoryDTO → Message
      const messages = response.data.map((dto) =>
        mapMessageHistoryDTOToMessage(dto, conversationId, currentUserEmail)
      );

      console.log(
        '[ChatService] Histórico carregado:',
        messages.length,
        'mensagens'
      );
      return messages;
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
    // ⚠️ Validação: conversationId é obrigatório
    if (!conversationId || conversationId === undefined || conversationId === null) {
      console.warn('[ChatService] ⚠️ markAsRead chamado sem conversationId válido:', {
        conversationId,
        type: typeof conversationId,
      });
      return; // Sai silenciosamente em vez de fazer uma requisição ruim
    }

    try {
      const url = `/chat/conversations/${conversationId}/read`;
      console.log('[ChatService] Marcando como lida - URL:', url);

      await api.post(url);

      console.log('[ChatService] ✅ Marcado como lido:', conversationId);
    } catch (error) {
      // Extrai mais informações do erro
      const errorDetails = {
        conversationId,
        status: error instanceof Error && 'response' in error ? (error as any).response?.status : 'N/A',
        statusText: error instanceof Error && 'response' in error ? (error as any).response?.statusText : 'N/A',
        responseData: error instanceof Error && 'response' in error ? (error as any).response?.data : null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };

      console.error('[ChatService] ❌ Erro ao marcar como lido:', errorDetails);
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
