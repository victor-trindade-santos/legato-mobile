/**
 * LEGATO — WebSocket Service (STOMP)
 *
 * Gerencia conexão WebSocket com backend via STOMP protocol.
 * Responsabilidades:
 * - Abrir/fechar conexão WebSocket
 * - Autenticar via JWT no handshake
 * - Subscrever no canal privado do usuário (/user/queue/messages)
 * - Enviar mensages
 * 
 * Não faz:
 * - Gerenciamento de estado
 * - Lógica de negócio
 * - Conhece componentes ou viewModels
 */



import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { IncomingWSMessage, OutgoingWSMessage, MessageHandler } from '@/types/WebSocket.types';


// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const WS_URL = 'wss://legato-mobile-backend.onrender.com/ws-chat';

/**
 * Canal onde o usuário recebe mensagens privadas.
 * O /user/ é automaticamente prefixado pelo STOMP com o ID
 * do usuário autenticado — ou seja, cada usuário recebe
 * apenas as mensagens destinadas a ele.
 */
const SUBSCRIBE_DESTINATION = '/user/queue/messages';

/**
 * Canal para onde enviamos mensagens.
 * O /app/ é o prefixo que o backend definiu como
 * "applicationDestinationPrefixes" — significa que essa
 * mensagem vai ser processada por um @MessageMapping no servidor.
 */
const SEND_DESTINATION = '/app/sendMessage';


// ─────────────────────────────────────────────────────────────
// SERVIÇO
// ─────────────────────────────────────────────────────────────
export class WebSocketService {
  /**
   * O Client do @stomp/stompjs é quem gerencia toda a
   * conexão STOMP por baixo dos panos — reconexão automática,
   * heartbeat, framing das mensagens, etc.
 */
  private client: Client;

  /**
   * Guardamos a referência da subscription para poder
   * cancelar (unsubscribe) quando necessário — por exemplo,
   * quando o usuário sai da tela de chat.
 */
  private subscription: StompSubscription | null = null;

  /** Flag para saber se estamos conectados */
  private isConnected: boolean = false;

  constructor(token: string, onMessage: MessageHandler) {
    this.client = new Client({
      /**
       * brokerURL: endereço direto do WebSocket.
       *
       * Usamos /websocket no final porque o SockJS (que o backend
       * usa como fallback) expõe o WebSocket nativo nesse sub-path.
       * Com o @stomp/stompjs puro (sem SockJS no front), precisamos
       * apontar diretamente para o endpoint WebSocket nativo.
       */
      brokerURL: WS_URL,

      /**
       * connectHeaders: headers enviados no frame STOMP CONNECT.
       * É aqui que mandamos o JWT para o backend autenticar.
       * O backend tem um AuthHandshakeInterceptor que lê esse header.
       */
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      /**
       * reconnectDelay: tempo em ms antes de tentar reconectar
       * automaticamente se a conexão cair. 5000ms = 5 segundos.
       * O próprio @stomp/stompjs gerencia isso pra você.
       */
      reconnectDelay: 5000,

      /**
     * onConnect: chamado quando a conexão STOMP é estabelecida
     * com sucesso (após o handshake e autenticação).
     * É aqui que fazemos o subscribe no canal privado.
     */
      onConnect: () => {
        console.log('[WebSocketService] ✅ Conectado ao STOMP');
        this.isConnected = true;

        /**
         * subscribe: nos inscrevemos no canal privado do usuário.
         * Toda vez que o backend mandar uma mensagem para esse usuário,
         * essa callback será chamada com o frame STOMP (IMessage).
         */
        this.subscription = this.client.subscribe(
          SUBSCRIBE_DESTINATION,
          (frame: IMessage) => {
            try {
              /**
               * frame.body é sempre uma string.
               * O backend manda JSON, então precisamos parsear.
               */
              const message: IncomingWSMessage = JSON.parse(frame.body);
              console.log('[WebSocketService] 📨 Mensagem recebida:', message)
            } catch (err) {
              console.error('[WebSocketService] ❌ Erro ao parsear mensagem:', err);
            }
          }
        );
      },

      onDisconnect: () => {
        console.log('[WebSocketService] 🔌 Desconectado do STOMP');
        this.isConnected = false;
      },

      onStompError: (frame) => {
        console.error('[WebSocketService] ❌ Erro STOMP:', frame.headers['message']);
      },

      onWebSocketError: (event) => {
        console.error('[WebSocketService] ❌ Erro WebSocket:', event);
      },
    });
  }

  /**
   * connect()
   *
   * Ativa o cliente STOMP — abre a conexão WebSocket e
   * inicia o processo de handshake STOMP.
   * Deve ser chamado uma vez quando o usuário entra no chat.
   */
  connect(): void {
    if (this.isConnected) {
      console.warn('[WebSocketService] ⚠️ Já conectado, ignorando connect()');
      return;
    }
    console.log('[WebSocketService] 🔄 Conectando...');
    this.client.activate();
  }

  /**
   * disconnect()
   *
   * Cancela a subscription e fecha a conexão STOMP de forma limpa.
   * Deve ser chamado quando o usuário sai da tela de chat.
   * Se não fizer isso, a conexão fica aberta à toa consumindo recursos.
   */
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.client.deactivate();
    this.isConnected = false;
    console.log('[WebSocketService] 👋 Desconectado manualmente');
  }

  /**
   * sendMessage()
   *
   * Publica uma mensagem no canal /app/sendMessage.
   * O backend vai processar e entregar para o receiverId.
   *
   * @param receiverId - ID do usuário que vai receber a mensagem
   * @param content - Texto da mensagem
   */
  sendMessage(receiverId: number, content: string): void {
    if (!this.isConnected) {
      console.error('[WebSocketService] ❌ Não conectado. Não foi possível enviar.');
      return;
    }

    const payload: OutgoingWSMessage = {receiverId, content};

    /**
     * publish: envia um frame STOMP SEND para o destination.
     * body precisa ser uma string — por isso serializamos para JSON.
     */
    this.client.publish({
      destination: SEND_DESTINATION,
      body: JSON.stringify(payload),
    });

    console.log('[WebSocketService] 📤 Mensagem enviada:', payload);
  }

  /** Retorna true se a conexão estiver ativa */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

}