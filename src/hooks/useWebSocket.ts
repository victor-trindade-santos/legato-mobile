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
import type { MessageHandler } from "@/types/WebSocket.types";

interface UseWebSocketOptions {
    /** JWT token para autenticação */
    token: string;
    /**
     * Callback chamada toda vez que uma mensagem nova chegar
     * Quem passa isso é o ViewModel, que decide o que vai fazer com a mensagem
     */
    onMessage: MessageHandler;
}

interface UseWebSocketReturn {
    /** Função para enviar uma mensagem via WebSocket */
    sendMessage: (receiverId: number, content: string) => void;
}

export function useWebSocket({ token, onMessage }: UseWebSocketOptions): UseWebSocketReturn {

    /**
     * useRef aqui é fundamental.
     *
     * Diferente de useState, o useRef:
     * - NÃO causa rerender quando muda
     * - Persiste o mesmo valor entre todos os renders
     *
     * Isso garante que temos UMA ÚNICA instância do WebSocketService
     * durante toda a vida do componente — não uma nova a cada render.
     */
    const wsRef = useRef<WebSocketService | null>(null);

    /**
     * onMessageRef guarda a versão mais atual do callback onMessage.
     *
     * Por que isso é necessário?
     * O useEffect abaixo roda apenas uma vez ([] como dependência).
     * Sem esse ref, o onMessage que o WebSocketService enxerga ficaria
     * "congelado" na versão do primeiro render — nunca atualizaria.
     * Com o ref, sempre chamamos a versão atual sem precisar recriar
     * o serviço.
     */
    const onMessageRef = useRef<MessageHandler>(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        /**
         * Criamos o serviço passando um wrapper que sempre usa
         * onMessageRef.current — assim pegamos sempre a versão
         * mais recente do callback.
         */
        const service = new WebSocketService(
            token,
            (message) => onMessageRef.current(message),
        );

        console.log('[useWebSocket] 🟢 Hook montado — conectando...');
        wsRef.current = service;
        service.connect();

        /**
         * Cleanup: essa função roda automaticamente quando o componente
         * que usa esse hook é desmontado (ex: usuário volta para a lista).
         * É aqui que garantimos que a conexão é fechada corretamente.
         */

        return () => {
            console.log('[useWebSocket] 🔴 Hook desmontando — desconectando...');
            service.disconnect();
            wsRef.current = null;
        };

        /**
         * [] significa que esse efeito roda apenas UMA VEZ:
         * quando o componente monta. Não queremos recriar a conexão
         * a cada render — apenas uma conexão por sessão de chat.
         */
    }, []);

    /**
     * sendMessage é a única coisa que expusemos para fora.
     * O ViewModel vai chamar isso quando o usuário apertar enviar.
     */

    const sendMessage = (receiverId: number, content: string) => {
        if (!wsRef.current) {
            console.error('[useWebSocket] ❌ wsRef.current é null — serviço não inicializado.');
            return;
        }
        wsRef.current.sendMessage(receiverId, content);
    };

    return {
        sendMessage
    };

}