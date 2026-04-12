/**
 * useWebSocket
 *
 * Hook que gerencia o ciclo de vida do WebSocketService dentro do React.
 *
 * Responsabilidades:
 * ✓ Instanciar o WebSocketService uma única vez (via useRef)
 * ✓ Conectar quando o hook monta
 * ✓ Desconectar quando o hook desmonta (cleanup)
 * ✓ Expor sendMessage para quem usar o hook
 *
 * NÃO faz:
 * ✗ Atualiza estado de mensagens (isso é responsabilidade do ViewModel)
 * ✗ Lógica de negócio
 */

import { useEffect, useRef } from "react";
import { WebSocketService } from "@/services/websocket/WebSocketService";
import type { MessageHandler, TypingHandler } from "@/types/WebSocket.types";

interface UseWebSocketOptions {
    /** JWT token para autenticação */
    token: string;
    /**
     * Callback chamada toda vez que uma mensagem nova chegar.
     * Quem passa isso é o ViewModel, que decide o que vai fazer com a mensagem.
     */
    onMessage: MessageHandler;
    /**
     * ID do chat atual. Obrigatório para receber eventos de typing.
     */
    chatId?: number;
    /**
     * Callback chamada quando um evento de typing chegar.
     * Se omitida, o subscribe de typing não é feito.
     */
    onTyping?: TypingHandler;
}

interface UseWebSocketReturn {
    /** Função para enviar uma mensagem via WebSocket */
    sendMessage: (receiverId: number, content: string) => void;
    /** Função para publicar status de digitando */
    sendTyping: (chatId: number, userId: number, isTyping: boolean) => void;
}

export function useWebSocket({ token, onMessage, chatId, onTyping }: UseWebSocketOptions): UseWebSocketReturn {

    const wsRef = useRef<WebSocketService | null>(null);

    /**
     * Refs para os callbacks — garantem que o WebSocketService sempre
     * chama a versão mais recente sem precisar recriar a conexão.
     */
    const onMessageRef = useRef<MessageHandler>(onMessage);
    const onTypingRef = useRef<TypingHandler | undefined>(onTyping);

    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onTypingRef.current = onTyping; }, [onTyping]);

    useEffect(() => {
        const service = new WebSocketService(
            token,
            (message) => onMessageRef.current(message),
        );

        wsRef.current = service;
        service.connect();

        // Subscribe de typing: só se chatId e onTyping forem fornecidos.
        if (chatId !== undefined && onTyping !== undefined) {
            service.subscribeToTyping(chatId, (dto) => onTypingRef.current?.(dto));
        }

        return () => {
            service.disconnect();
            wsRef.current = null;
        };
    }, []);

    const sendMessage = (receiverId: number, content: string) => {
        wsRef.current?.sendMessage(receiverId, content);
    };

    const sendTyping = (chatId: number, userId: number, isTyping: boolean) => {
        wsRef.current?.sendTyping(chatId, userId, isTyping);
    };

    return { sendMessage, sendTyping };

}