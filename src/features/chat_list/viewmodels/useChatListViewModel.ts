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
import { set } from 'react-hook-form';

export function useChatListViewModel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [chatItems, setChatItems] = useState<ChatItemDTO[]>([]);
    const [filteredChatItems, setFilteredChatItems] = useState<ChatItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadChatItems() {
        setIsLoading(true);
        setError(null);

        try {
            const items = await fetchChatItemsList();
            console.log('[ChatListViewModel] Items carregados do serviço:', items);
            
            setChatItems(items || []);
            setFilteredChatItems(items || []);
            
            console.log('[ChatListViewModel] Items salvos no state:', items);
        } catch (err: any) {
            console.error('[ChatListViewModel] Erro ao carregar items:', err);
            setError('Erro ao carregar a lista de chats. Tente novamente mais tarde.');
            setChatItems([]);
            setFilteredChatItems([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadChatItems();
    }, []); 

    const handleSearch = () => {
        if(!searchQuery) return setFilteredChatItems(chatItems);

        const term = searchQuery.toLowerCase();
        const result = chatItems.filter(item =>
            item.otherUserName.toLowerCase().includes(term)
        )

        return setFilteredChatItems(result)
    };


    return {
        chatItems: filteredChatItems,
        handleSearch,
        searchQuery,
        setSearchQuery,
        isLoading,
        error
    };

}