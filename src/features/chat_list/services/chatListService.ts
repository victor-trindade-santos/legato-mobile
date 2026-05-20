import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { mockChatItems } from '../mocks/chatitens.mock';
import type { ChatItemDTO } from '../models/ChatItemDTO';

/**
 * Mapeia resposta do backend para modelo interno
 * Converte chatId (backend) para id (frontend)
 */
function mapBackendResponse(item: any): ChatItemDTO {
  return {
    chatId: item.chatId,
    otherUserId: item.otherUserId,
    otherUserName: item.otherUserName,
    otherUserProfilePictureUrl: item.otherUserProfilePictureUrl || item.otherUserProfilePicture,
    lastMessageContent: item.lastMessageContent,
    lastMessageTimestamp: item.lastMessageTimestamp
  };
}

export async function fetchChatItemsList(): Promise<ChatItemDTO[]> {
    if (Config.DEV_USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay de rede
        return mockChatItems;
    }
    
    const res = await api.get<any[]>(Endpoints.chat.list);

    console.log('[chatListService] raw response[0]:', JSON.stringify(res.data[0], null, 2));

    // Mapeia cada item da resposta do backend
    const mappedItems = res.data.map(mapBackendResponse);
    
    return mappedItems;
}