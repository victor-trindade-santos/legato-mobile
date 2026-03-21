/**
 * useChatListViewModel.ts - ViewModel
 * 
 * Responsavel por:
 * - Carregar a lista de chats do usuário
 * - Gerenciar estado de loading e busca
 * - Expor handlers para a ChatListScreen
 */

import { useState, useEffect } from 'react';
import { fetchChatItemsList } from '../services/chatListService';
import { ChatItemDTO } from '../models/ChatItemDTO'; // Make sure this import path is correct

export function useChatListViewModel() {
    const [chatItems, setChatItems] = useState<ChatItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadChatItems() {
        setIsLoading(true);
        setError(null);

        try {
            const items = await fetchChatItemsList();
            setChatItems(items);
        } catch (err) {
            setError('Erro ao carregar a lista de chats. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadChatItems();
    }, []);

    return {
        chatItems,
        isLoading,
        error
    };

}