import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { MessageHandler, TypingDTO, TypingHandler } from '@/types/WebSocket.types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'wss://legato-mobile-backend.onrender.com/ws-chat';
const SEND_DESTINATION = '/app/sendMessage';

export class WebSocketService {
  private client: Client;
  private messageSubscription: StompSubscription | null = null;
  private typingSubscription: StompSubscription | null = null;
  private isConnected: boolean = false;
  private readonly chatId: number;

  constructor(token: string, chatId: number, onMessage: MessageHandler, onTyping?: TypingHandler) {
    this.chatId = chatId;

    this.client = new Client({
      brokerURL: `${WS_URL}?token=${token}`,
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
