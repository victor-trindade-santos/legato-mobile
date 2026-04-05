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
import SockJS from 'sockjs-client';
import type { IncomingWSMessage, OutgoingWSMessage, MessageHandler } from '@/types/WebSocket.types';


// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'wss://legato-mobile-backend.onrender.com/ws-chat';

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
       * webSocketFactory: função que o cliente STOMP chama internamente
       * para criar a instância de transporte da conexão.
       *
       * O STOMP é um protocolo de mensageria que roda SOBRE o WebSocket.
       * Pensa assim:
       * - WebSocket = o tubo (conexão bruta entre cliente e servidor)
       * - STOMP     = o protocolo que define como as mensagens trafegam dentro desse tubo
       * - SockJS    = uma camada acima do WebSocket que garante compatibilidade
       *               entre diferentes ambientes (browsers antigos, proxies, etc)
       *
       * O backend usa SockJS com .withSockJS() — isso significa que ele não
       * aceita WebSocket puro. O SockJS tem um protocolo próprio de framing:
       * ele embrulha cada mensagem em um array JSON antes de enviar.
       *
       * Exemplo do que o SockJS espera receber:
       *   WebSocket puro manda:  CONNECT\naccept-version:1.0...
       *   SockJS espera receber: ["CONNECT\naccept-version:1.0..."]
       *
       * Por isso não podemos usar new WebSocket() diretamente — o backend
       * receberia o frame STOMP sem o embrulho JSON e quebraria a conexão.
       *
       * Usando o SockJS client, ele cuida automaticamente de:
       * - Montar a URL no formato correto que o SockJS server espera
       * - Embrulhar e desembrulhar as mensagens no formato JSON do SockJS
       * - Negociar o melhor transporte disponível (WebSocket, long-polling, etc)
       *
       * O token JWT vai como query param (?token=...) na URL porque o
       * AuthHandshakeInterceptor no backend lê a autenticação assim:
       *   request.getURI().getQuery() → extrai o token= da URL
       */
      webSocketFactory: () => {
        const url = `${WS_URL}?token=${token}`;
        console.log(`[WebSocketService] 🌐 Conectando via SockJS: ${url}`);
        return new SockJS(url);
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
              onMessage(message);
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

    const payload: OutgoingWSMessage = {
      receiver: {
        id: receiverId, // 👈 agora no formato que o backend espera
      },
      content,
    };

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