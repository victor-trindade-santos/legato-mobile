import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { MediaType, MessageHandler, MessageStatusUpdateDTO, PresenceHandler, StatusUpdateHandler, TypingDTO, TypingHandler, UserPresenceDTO } from '@/types/WebSocket.types';
import { Config } from '@/constants/config';

const SEND_DESTINATION = '/app/sendMessage';

export class WebSocketService {
  private readonly client: Client;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private presenceSubscription: StompSubscription | null = null;
  private statusSubscription: StompSubscription | null = null;
  private isConnected: boolean = false;
  private readonly chatId: number;
  private storedPresenceUserId?: number;
  private storedPresenceHandler?: PresenceHandler;

  constructor(
    token: string,
    chatId: number,
    onMessage: MessageHandler,
    onTyping?: TypingHandler,
    myUserId?: number,
    onStatusUpdate?: StatusUpdateHandler,
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

        if (myUserId != null && onStatusUpdate) {
          const statusTopic = `/topic/users/${myUserId}/messages/status`;
          console.log('[WS] 🔔 Subscrevendo status updates | topic=', statusTopic);
          this.statusSubscription = this.client.subscribe(
            statusTopic,
            (frame: IMessage) => {
              try {
                const dto: MessageStatusUpdateDTO = JSON.parse(frame.body);
                console.log('[WS] 📬 Status update recebido:', dto);
                onStatusUpdate(dto);
              } catch (err) {
                console.error('[WS] ❌ Erro ao ler status update:', err);
              }
            }
          );
        } else {
          console.warn('[WS] ⚠️ Status subscription IGNORADA | myUserId=', myUserId, '| onStatusUpdate=', typeof onStatusUpdate);
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
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
      this.statusSubscription = null;
    }
    this.client.deactivate();
    this.isConnected = false;
  }

  sendDelivered(chatId: number, messageId: number): void {
    if (!this.isConnected) return;
    this.client.publish({
      destination: `/app/chat/${chatId}/message/${messageId}/delivered`,
      body: '',
    });
  }

  sendRead(chatId: number): void {
    if (!this.isConnected) {
      console.warn('[WS] ⚠️ sendRead ignorado — não conectado | chatId=', chatId);
      return;
    }
    console.log('[WS] 📖 Enviando sendRead | chatId=', chatId);
    this.client.publish({
      destination: `/app/chat/${chatId}/read`,
      body: '',
    });
  }

  sendMessage(
    receiverId: number,
    content: string,
    repliedMessageId?: number,
    typeMedia?: MediaType,
    mediaUrl?: string,
  ): void {
    if (!this.isConnected) return;

    this.client.publish({
      destination: SEND_DESTINATION,
      body: JSON.stringify({
        receiverId,
        content,
        repliedMessageId: repliedMessageId ?? null,
        ...(typeMedia && typeMedia !== 'NONE' ? { typeMedia, mediaUrl } : {}),
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
