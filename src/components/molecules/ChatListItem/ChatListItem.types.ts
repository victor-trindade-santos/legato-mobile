import type { MediaType } from '@/types/WebSocket.types';

export interface ChatListItemProps {
    userAvatar: string;
    userName: string;
    lastMessage: string;
    lastMessageType?: MediaType;
    timeStamp: string;
    isOnline?: boolean;
    isTyping?: boolean;

    onPress: () => void;
}