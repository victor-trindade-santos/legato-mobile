/**
 * Mock de itens de chat para desenvolvimento local.
 * Usado pelo chatListService quando DEV_USE_MOCK=true.
 */

import type { ChatItemDTO } from '../models/ChatItemDTO';

export const mockChatItems: ChatItemDTO[] = [
    {
        id: '1',
        name: 'John Doe',
        lastMessage: 'Olá, como você está?',
        timeStamp: '1 hora',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
        id: '2',
        name: 'Jane Smith',
        lastMessage: 'Vamos marcar uma reunião?',
        timeStamp: 'Ontem',
        avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
        id: '3',
        name: 'Carlos Silva',
        lastMessage: 'Enviei o arquivo solicitado.',
        timeStamp: '2 dias',
        avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
        id: '4',
        name: 'Maria Oliveira',
        lastMessage: 'Obrigado pela ajuda!',
        timeStamp: '30 min',
        avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
    }
];