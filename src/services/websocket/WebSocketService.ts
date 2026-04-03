/**
 * LEGATO — WebSocket Service (STOMP)
 *
 * Gerencia conexão WebSocket com backend via STOMP protocol.
 * Responsabilidades:
 * - Conectar ao endpoint /ws-chat com JWT token
 * - Subscrever em /user/queue/messages (receber mensagens)
 * - Enviar para /app/sendMessage (mandar mensagens)
 * - Reconexão automática com exponential backoff
 * - Notificar listeners sobre estado de conexão e mensagens
 */

import { Client, IFrame } from '@stomp/stompjs';
import { storage } from '@/utils/storage';
import { Config } from '@/constants/config';
import type {
  ReceiveMessagePayload,
  SendMessagePayload,
} from '@/features/chat/models/MessageModel';

import type {
    StompConnectConfig,
    WebSocketConnectionStatus
} from '@/types/WebSocket.types';

type MessageCallback = (message: ReceiveMessagePayload) => void;
type ConnectionStatusCallback = (status: WebSocketConnectionStatus) => void;
type ErrorCallback = (error: string) => void;

interface Subscription {
  id: string;
  destination: string;
  callback: MessageCallback;
}

class WebSocketServiceImpl {
  private client: Client | null = null;
  private connectionStatus: WebSocketConnectionStatus = 'idle';
  private subscriptions: Map<string, Subscription> = new Map();

  // Callbacks
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();

  // Reconnection config
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15;
  private reconnectDelay = 1000; // 1 segundo inicial
  private maxReconnectDelay = 30000; // 30 segundos máximo
  private reconnectTimer: NodeJS.Timeout | null = null;

  /**
   * Conecta ao servidor WebSocket
   * Injeta automaticamente o JWT token no header
   */
  async connect(): Promise<void> {
    if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
      console.warn('[WebSocket] Já conectado ou conectando');
      return;
    }

    try {
      this.setConnectionStatus('connecting');

      // Recupera token do storage
      const token = await storage.getItem(Config.TOKEN_KEY);
      if (!token) {
        throw new Error('Token JWT não encontrado no storage');
      }

      // Cria cliente STOMP
      this.client = new Client({
        brokerURL: Config.WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        // Callbacks de ciclo de vida
        onConnect: this.handleConnect.bind(this),
        onDisconnect: this.handleDisconnect.bind(this),
        onStompError: this.handleError.bind(this),
        onWebSocketError: this.handleWebSocketError.bind(this),
        // Reconnection automática
        reconnectDelay: 5000, // 5 segundos entre tentativas
        heartbeatIncoming: 60000,
        heartbeatOutgoing: 60000,
      });

      // Ativa debug em dev
      if (__DEV__) {
        this.client.debug = (str) => console.log('[STOMP Debug]', str);
      }

      // Inicia conexão
      this.client.activate();
    } catch (error) {
      this.handleError(`Erro ao conectar WebSocket: ${error}`);
      this.setConnectionStatus('error');
    }
  }

  /**
   * Desconecta do servidor WebSocket
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client?.active) {
      await this.client.deactivate();
    }

    this.subscriptions.clear();
    this.setConnectionStatus('disconnected');
  }

  /**
   * Subscreve a um tópico/fila e configura callback
   * @param destination ex: "/user/queue/messages"
   * @param callback Função chamada quando chegar mensagem
   */
  subscribe(destination: string, callback: MessageCallback): string {
    if (!this.client?.connected) {
      throw new Error('WebSocket não conectado. Chame connect() primeiro.');
    }

    const subscriptionId = `sub-${Date.now()}-${Math.random()}`;

    try {
      this.client.subscribe(destination, (frame) => {
        try {
          const payload = JSON.parse(frame.body) as ReceiveMessagePayload;
          callback(payload);
        } catch (error) {
          this.handleError(`Erro ao parsear mensagem: ${error}`);
        }
      });

      // Armazena subscrição para limpeza posterior
      this.subscriptions.set(subscriptionId, {
        id: subscriptionId,
        destination,
        callback,
      });

      console.log('[WebSocket] Subscrito em:', destination);
      return subscriptionId;
    } catch (error) {
      this.handleError(`Erro ao subscrever em ${destination}: ${error}`);
      throw error;
    }
  }

  /**
   * Remove subscrição
   * @param subscriptionId ID retornado por subscribe()
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Envia uma mensagem para o backend
   * @param payload {receiverId, content}
   */
  send(payload: SendMessagePayload): void {
    if (!this.client?.connected) {
      throw new Error('WebSocket não conectado');
    }

    try {
      this.client.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify(payload),
        headers: {
          'content-type': 'application/json',
        },
      });

      console.log('[WebSocket] Mensagem enviada para:', payload.receiverId);
    } catch (error) {
      this.handleError(`Erro ao enviar mensagem: ${error}`);
      throw error;
    }
  }

  /**
   * Retorna status atual de conexão
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Registra callback para mudanças de status
   */
  onStatusChange(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    // Retorna função para remover listener
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Registra callback para erros
   */
  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.add(callback);
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  // ────────────────────────────────────────────────────────────────
  // HANDLERS PRIVADOS (callbacks internos)
  // ────────────────────────────────────────────────────────────────

  private handleConnect(frame: IFrame): void {
    console.log('[WebSocket] Conectado ao servidor:', frame);
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000; // Reset delay
    this.setConnectionStatus('connected');
  }

  private handleDisconnect(frame: IFrame): void {
    console.log('[WebSocket] Desconectado:', frame);
    this.setConnectionStatus('disconnected');
    
    // Tenta reconectar se teve erro
    if (frame.body && frame.headers?.message !== 'OK') {
      this.attemptReconnect();
    }
  }

  private handleError(error: string | IFrame): void {
    const errorMsg = typeof error === 'string' ? error : error.body || 'Erro desconhecido';
    console.error('[WebSocket] Erro:', errorMsg);
    this.setConnectionStatus('error');
    this.errorCallbacks.forEach(cb => cb(errorMsg));
    this.attemptReconnect();
  }

  private handleWebSocketError(event: Event): void {
    console.error('[WebSocket] Erro WebSocket:', event);
    this.setConnectionStatus('error');
    this.errorCallbacks.forEach(cb => cb('Erro de conexão WebSocket'));
    this.attemptReconnect();
  }

  /**
   * Tenta reconectar com exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Máximo de tentativas de reconexão atingido');
      this.setConnectionStatus('disconnected');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `[WebSocket] Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.setConnectionStatus('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Falha ao reconectar:', error);
      });
    }, delay);
  }

  /**
   * Atualiza status de conexão e notifica listeners
   */
  private setConnectionStatus(status: WebSocketConnectionStatus): void {
    if (this.connectionStatus === status) return;

    this.connectionStatus = status;
    console.log('[WebSocket] Status:', status);
    this.statusCallbacks.forEach(cb => cb(status));
  }
}

// Singleton instance
export const WebSocketService = new WebSocketServiceImpl();
