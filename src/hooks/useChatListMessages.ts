import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { Config } from '@/constants/config';
import type { IncomingWSMessage, MediaType, TypingDTO } from '@/types/WebSocket.types';

type LastMessageUpdate = { content: string; timestamp: string; typeMedia?: MediaType };
type HookReturn = {
  messageMap: Record<number, LastMessageUpdate>;
  typingMap: Record<number, boolean>;
};

export function useChatListMessages(
  token: string,
  chatIds: number[],
  currentUserId: number | null,
): HookReturn {
  const [messageMap, setMessageMap] = useState<Record<number, LastMessageUpdate>>({});
  const [typingMap, setTypingMap] = useState<Record<number, boolean>>({});
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const chatIdsKey = [...chatIds].sort().join(',');

  useEffect(() => {
    if (!token || chatIds.length === 0) return;

    const client = new Client({
      brokerURL: `${Config.WS_URL}?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        chatIds.forEach(chatId => {
          client.subscribe(`/topic/chats/${chatId}/messages`, (frame) => {
            try {
              const msg: IncomingWSMessage = JSON.parse(frame.body);
              setMessageMap(prev => ({
                ...prev,
                [chatId]: { content: msg.content, timestamp: new Date().toISOString(), typeMedia: msg.typeMedia },
              }));
              // Mensagem nova limpa o "digitando..."
              setTypingMap(prev => ({ ...prev, [chatId]: false }));
              if (typingTimersRef.current[chatId]) {
                clearTimeout(typingTimersRef.current[chatId]);
                delete typingTimersRef.current[chatId];
              }
            } catch (err) {
              console.error('[ChatListMessages] ❌ Erro ao ler mensagem:', err);
            }
          });

          client.subscribe(`/topic/chats/${chatId}/typing`, (frame) => {
            try {
              const dto: TypingDTO = JSON.parse(frame.body);
              if (dto.userId === currentUserId) return;

              setTypingMap(prev => ({ ...prev, [chatId]: dto.typing }));

              if (dto.typing) {
                if (typingTimersRef.current[chatId]) clearTimeout(typingTimersRef.current[chatId]);
                typingTimersRef.current[chatId] = setTimeout(() => {
                  setTypingMap(prev => ({ ...prev, [chatId]: false }));
                  delete typingTimersRef.current[chatId];
                }, 5000);
              } else {
                if (typingTimersRef.current[chatId]) {
                  clearTimeout(typingTimersRef.current[chatId]);
                  delete typingTimersRef.current[chatId];
                }
              }
            } catch (err) {
              console.error('[ChatListMessages] ❌ Erro ao ler typing:', err);
            }
          });
        });
      },
      onStompError: (frame) => {
        console.error('[ChatListMessages] ❌ STOMP error:', frame.headers['message']);
      },
    });

    client.activate();

    return () => {
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
      client.deactivate();
    };
  }, [token, chatIdsKey]);

  return { messageMap, typingMap };
}
