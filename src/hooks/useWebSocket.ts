import { useEffect, useRef } from "react";
import { WebSocketService } from "@/services/websocket/WebSocketService";
import type { MediaType, MessageHandler, PresenceHandler, StatusUpdateHandler, TypingHandler } from "@/types/WebSocket.types";

interface UseWebSocketOptions {
    token: string;
    chatId: number;
    onMessage: MessageHandler;
    onTyping?: TypingHandler;
    otherUserId?: number;
    onPresence?: PresenceHandler;
    myUserId?: number;
    onStatusUpdate?: StatusUpdateHandler;
}

interface UseWebSocketReturn {
    sendMessage: (receiverId: number, content: string, repliedMessageId?: number, typeMedia?: MediaType, mediaUrl?: string) => void;
    sendTyping: (userId: number, isTyping: boolean) => void;
    sendDelivered: (chatId: number, messageId: number) => void;
    sendRead: (chatId: number) => void;
}

export function useWebSocket({ token, chatId, onMessage, onTyping, otherUserId, onPresence, myUserId, onStatusUpdate }: UseWebSocketOptions): UseWebSocketReturn {
    const wsRef = useRef<WebSocketService | null>(null);

    const onMessageRef = useRef<MessageHandler>(onMessage);
    const onTypingRef = useRef<TypingHandler | undefined>(onTyping);
    const onPresenceRef = useRef<PresenceHandler | undefined>(onPresence);
    const onStatusUpdateRef = useRef<StatusUpdateHandler | undefined>(onStatusUpdate);

    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onTypingRef.current = onTyping; }, [onTyping]);
    useEffect(() => { onPresenceRef.current = onPresence; }, [onPresence]);
    useEffect(() => { onStatusUpdateRef.current = onStatusUpdate; }, [onStatusUpdate]);

    useEffect(() => {
        if (!token) {
            console.warn('[useWebSocket] token vazio — conexão NÃO será iniciada.');
            return;
        }

        console.log('[useWebSocket] construindo service | otherUserId=', otherUserId, '| onPresence=', typeof onPresence);

        const service = new WebSocketService(
            token,
            chatId,
            (message) => onMessageRef.current(message),
            onTyping ? (dto) => onTypingRef.current?.(dto) : undefined,
            myUserId,
            onStatusUpdate ? (dto) => onStatusUpdateRef.current?.(dto) : undefined,
        );

        wsRef.current = service;
        service.connect();

        return () => {
            console.log('[useWebSocket] unmount → desconectando');
            service.disconnect();
            wsRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (otherUserId == null || !onPresence) return;
        wsRef.current?.subscribeToPresence(
            otherUserId,
            (dto) => onPresenceRef.current?.(dto),
        );
    }, [otherUserId]);

    const sendMessage = (receiverId: number, content: string, repliedMessageId?: number, typeMedia?: MediaType, mediaUrl?: string) => {
        wsRef.current?.sendMessage(receiverId, content, repliedMessageId, typeMedia, mediaUrl);
    };

    const sendTyping = (userId: number, isTyping: boolean) => {
        wsRef.current?.sendTyping(userId, isTyping);
    };

    const sendDelivered = (chatId: number, messageId: number) => {
        wsRef.current?.sendDelivered(chatId, messageId);
    };

    const sendRead = (chatId: number) => {
        wsRef.current?.sendRead(chatId);
    };

    return { sendMessage, sendTyping, sendDelivered, sendRead };
}
