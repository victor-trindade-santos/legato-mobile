import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchChatItemsList } from '../services/chatListService';
import { ChatItemDTO } from '../models/ChatItemDTO';
import { useAuthStore } from '@/store/authStore';
import { useChatListPresence } from '@/hooks/useChatListPresence';
import { useChatListMessages } from '@/hooks/useChatListMessages';

export function useChatListViewModel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [chatItems, setChatItems] = useState<ChatItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = useAuthStore(state => state.token);

    const loadChatItems = useCallback(() => {
        async function fetch() {
            setIsLoading(true);
            setError(null);
            try {
                const items = await fetchChatItemsList();
                console.log('[ChatList] lista carregada:', items.map(i => ({
                    name: i.otherUserName,
                    isOnline: i.isOnline,
                    lastSeen: i.lastSeen,
                })));
                setChatItems(items || []);
            } catch (err: any) {
                setError('Erro ao carregar a lista de chats. Tente novamente mais tarde.');
                setChatItems([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetch();
    }, []);

    useFocusEffect(loadChatItems);

    const currentUserId = useAuthStore(state => state.user?.id ?? null);
    const userIds = useMemo(() => chatItems.map(i => i.otherUserId), [chatItems]);
    const chatIds = useMemo(() => chatItems.map(i => i.chatId), [chatItems]);
    const presenceMap = useChatListPresence(token ?? '', userIds);
    const { messageMap, typingMap } = useChatListMessages(token ?? '', chatIds, currentUserId);

    const chatItemsWithPresence = useMemo(() =>
        chatItems.map(item => ({
            ...item,
            isOnline: presenceMap[item.otherUserId]?.isOnline ?? item.isOnline,
            lastSeen: presenceMap[item.otherUserId]?.lastSeen ?? item.lastSeen,
            lastMessageContent: messageMap[item.chatId]?.content ?? item.lastMessageContent,
            lastMessageTimestamp: messageMap[item.chatId]?.timestamp ?? item.lastMessageTimestamp,
            lastMessageTypeMedia: messageMap[item.chatId]?.typeMedia ?? item.lastMessageTypeMedia,
            isTyping: typingMap[item.chatId] ?? false,
        })),
        [chatItems, presenceMap, messageMap, typingMap],
    );

    const filteredChatItems = useMemo(() => {
        if (!searchQuery) return chatItemsWithPresence;
        const term = searchQuery.toLowerCase();
        return chatItemsWithPresence.filter(item =>
            item.otherUserName.toLowerCase().includes(term)
        );
    }, [chatItemsWithPresence, searchQuery]);

    return {
        chatItems: filteredChatItems,
        handleSearch: () => {},
        searchQuery,
        setSearchQuery,
        isLoading,
        error,
    };
}
