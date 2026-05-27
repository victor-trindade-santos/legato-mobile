import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { Config } from '@/constants/config';
import type { UserPresenceDTO } from '@/types/WebSocket.types';

type PresenceState = { isOnline: boolean; lastSeen: string | null };

export function useChatListPresence(
  token: string,
  userIds: number[],
): Record<number, PresenceState> {
  const [presenceMap, setPresenceMap] = useState<Record<number, PresenceState>>({});
  const userIdsKey = [...userIds].sort().join(',');

  useEffect(() => {
    if (!token || userIds.length === 0) return;

    setPresenceMap({});

    const client = new Client({
      brokerURL: `${Config.WS_URL}?token=${token}`,
      reconnectDelay: 5000,
      onConnect: () => {
        userIds.forEach(userId => {
          client.subscribe(`/topic/users/${userId}/presence`, (frame) => {
            try {
              const dto: UserPresenceDTO = JSON.parse(frame.body);
              setPresenceMap(prev => ({
                ...prev,
                [dto.userId]: { isOnline: dto.isOnline, lastSeen: dto.lastSeen },
              }));
            } catch (err) {
              console.error('[ChatListPresence] ❌ Erro ao ler presença:', err);
            }
          });
        });
      },
      onStompError: (frame) => {
        console.error('[ChatListPresence] ❌ STOMP error:', frame.headers['message']);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [token, userIdsKey]);

  return presenceMap;
}
