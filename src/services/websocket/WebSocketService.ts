import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { MessageHandler, PresenceHandler, TypingDTO, TypingHandler, UserPresenceDTO } from '@/types/WebSocket.types';
import { Config } from '@/constants/config';

const SEND_DESTINATION = '/app/sendMessage';

export class WebSocketService {
  private readonly client: Client;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private presenceSubscription: StompSubscription | null = null;
  private isConnected: boolean = false;
  private readonly chatId: number;
  private storedPresenceUserId?: number;
  private storedPresenceHandler?: PresenceHandler;

  constructor(
    token: string,
    chatId: number,
    onMessage: MessageHandler,
    onTyping?: TypingHandler,
  ) {
    this.chatId = chatId;

    this.client = new Client({
      brokerURL: `${Config.WS_URL}?token=${token}`,
      reconnectDelay: 5000,

      onConnect: () => {
        console.log(`[WS] ✅ Conectado! Entrando na sala do Chat ${chatId}...`);
        this.isConnected = true;

        this.messageSubscription = this.client.subscribe(
          `/topic/chats/${chatId}/messages`,
          (frame: IMessage) => {
            try {
              const message = JSON.parse(frame.body);
              onMessage(message);
            } catch (err) {
              console.error('[WS] ❌ Erro ao ler mensagem:', err);
            }
          }
        );

        if (onTyping) {
          this.typingSubscription = this.client.subscribe(
            `/topic/chats/${chatId}/typing`,
            (frame: IMessage) => {
              try {
                const dto: TypingDTO = JSON.parse(frame.body);
                onTyping(dto);
              } catch (err) {
                console.error('[WS] ❌ Erro ao ler status de digitando:', err);
              }
            }
          );
        }

        if (this.storedPresenceUserId != null && this.storedPresenceHandler) {
          this.createPresenceSubscription(this.storedPresenceUserId, this.storedPresenceHandler);
        }
      },

      onDisconnect: () => {
        console.warn('[WS] ⚠️ Conexão encerrada.');
        this.isConnected = false;
      },

      onStompError: (frame) => {
        console.error(
          '[WS] ❌ STOMP error | message=', frame.headers['message'],
          '| body=', frame.body,
        );
      },

      onWebSocketError: (event) => {
        console.error('[WS] ❌ Erro na conexão:', event);
      },
    });
  }

  subscribeToPresence(otherUserId: number, handler: PresenceHandler): void {
    this.storedPresenceUserId = otherUserId;
    this.storedPresenceHandler = handler;
    if (this.isConnected) {
      this.createPresenceSubscription(otherUserId, handler);
    }
  }

  private createPresenceSubscription(otherUserId: number, handler: PresenceHandler): void {
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
    }
    console.log('[WS] 🟢 Subscrevendo presença userId=', otherUserId);
    this.presenceSubscription = this.client.subscribe(
      `/topic/users/${otherUserId}/presence`,
      (frame: IMessage) => {
        try {
          const dto: UserPresenceDTO = JSON.parse(frame.body);
          console.log('[WS] 📡 Presença recebida:', dto);
          handler(dto);
        } catch (err) {
          console.error('[WS] ❌ Erro ao ler presença:', err);
        }
      }
    );
  }

  connect(): void {
    if (!this.isConnected && !this.client.active) {
      this.client.activate();
    }
  }

  disconnect(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = null;
    }
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
      this.presenceSubscription = null;
    }
    this.client.deactivate();
    this.isConnected = false;
  }

  sendMessage(receiverId: number, content: string, repliedMessageId?: number): void {
    if (!this.isConnected) return;

    this.client.publish({
      destination: SEND_DESTINATION,
      body: JSON.stringify({
        receiverId,
        content,
        repliedMessageId: repliedMessageId ?? null,
      }),
    });
  }

  sendTyping(userId: number, isTyping: boolean): void {
    if (!this.isConnected) return;

    const payload: TypingDTO = { chatId: this.chatId, userId, typing: isTyping };

    this.client.publish({
      destination: `/app/chat/${this.chatId}/typing`,
      body: JSON.stringify(payload),
    });
  }
}
