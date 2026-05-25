/**
 * LEGATO — Chat HTTP Service
 *
 * Responsabilidade: Comunicação REST com backend
 * (Histórico de mensagens e upload de mídia de UMA conversa específica)
 *
 * ⚠️ IMPORTANTE:
 * - Usa HTTP (REST), não WebSocket
 * - Para ENVIAR texto, use WebSocketService
 * - Para LISTA DE CONVERSAS, use chatListService
 * - Dados vêm do BANCO DE DADOS (histórico persistido)
 */

import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { storage } from '@/utils/storage';
import type { MessageHistoryDTO } from '@/features/chat/models/MessageModel';

export async function fetchMessages(conversationId: number): Promise<MessageHistoryDTO[]> {
  const res = await api.get<MessageHistoryDTO[]>(Endpoints.chat.getById(conversationId));
  return res.data;
}

export async function uploadMedia(
  chatId: number,
  asset: ImagePickerAsset,
  receiverId: number,
): Promise<MessageHistoryDTO> {
  const mimeType = asset.mimeType ?? 'image/jpeg';
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const name = asset.fileName ?? `media_${Date.now()}.${ext}`;
  const token = await storage.getItem(Config.TOKEN_KEY);
  const url = `${Config.API_URL}${Endpoints.chat.uploadMedia(chatId)}`;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  if (Platform.OS === 'web') {
    // expo-image-picker expõe o File nativo do browser em asset.file (web-only).
    // Usar diretamente no FormData é o caminho correto e elimina o problema de
    // XHR para blob: URLs de vídeo, que ficam presos no pipeline de media do Chrome.
    const file = asset.file;
    console.log('[ChatService] uploadMedia web | mimeType=', mimeType, '| name=', name, '| file=', file?.name, '| size=', file?.size);
    if (!file) {
      throw new Error('asset.file não disponível — não é possível fazer upload no browser');
    }

    const formData = new FormData();
    formData.append('file', file, name);
    formData.append('receiverId', String(receiverId));
    console.log('[ChatService] POST', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    console.log('[ChatService] resposta | status=', response.status);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload falhou com status ${response.status}: ${text}`);
    }
    return response.json() as Promise<MessageHistoryDTO>;
  }

  // Android / iOS: XMLHttpRequest passa { uri, type, name } diretamente para o
  // módulo nativo NativeNetworking, que lê o arquivo do disco e monta o multipart.
  // fetch() na nova arquitetura (RN 0.76+) perde essa informação ao converter.
  const formData = new FormData();
  formData.append('file', { uri: asset.uri, type: mimeType, name } as any);
  formData.append('receiverId', String(receiverId));

  return new Promise<MessageHistoryDTO>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = 120_000;
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Resposta inválida do servidor'));
        }
      } else {
        reject(new Error(`Upload falhou com status ${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Erro de rede durante o upload'));
    xhr.ontimeout = () => reject(new Error('Timeout no upload'));
    xhr.send(formData);
  });
}