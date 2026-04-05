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
import type {MessageHistoryDTO } from '@/features/chat/models/MessageModel';

export async function fetchMessages(conversationId: number): Promise<MessageHistoryDTO[]> {
  const res = await api.get<MessageHistoryDTO[]>(Endpoints.chat.getById(conversationId));
  return res.data;
}