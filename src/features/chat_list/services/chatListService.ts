import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { mockChatItems } from '../mocks/chatitens.mock';
import type { ChatItemDTO } from '../models/ChatItemDTO';

export async function fetchChatItemsList(): Promise<ChatItemDTO[]> {
    if (Config.DEV_USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay de rede
        return mockChatItems;
    }
    
    const res = await api.get<ChatItemDTO[]>(Endpoints.chatListItem.list);
    return res.data;
}