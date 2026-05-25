
import { useEffect, useState, useCallback, useRef } from "react";
import * as ImagePicker from 'expo-image-picker';
import { fetchMessages, uploadMedia } from "../services/ChatService";
import { fetchChatItemsList } from "@/features/chat_list/services/chatListService";
import type { Message, MessageHistoryDTO } from "@/features/chat/models/MessageModel";
import { useAuthStore } from "@/store/authStore";
import { extractDateKey, extractDateLabel, formatNowToBackendFormat } from "@/utils/dateUtils";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { MediaType, MessageHandler, PresenceHandler, StatusUpdateHandler, TypingHandler } from "@/types/WebSocket.types";


export type ChatListItem =
  | { type: 'message'; data: Message }
  | { type: 'separator'; label: string; key: string };

function groupMessageWithSeparators(messages: Message[]): ChatListItem[] {
  const result: ChatListItem[] = [];
  let lastDateKey = '';

  for (const message of messages) {
    const dateKey = extractDateKey(message.timestamp);

    if (dateKey !== lastDateKey) {
      result.push({
        type: 'separator',
        label: extractDateLabel(message.timestamp),
        key: `separator-${dateKey}`,
      });
      lastDateKey = dateKey;
    }

    result.push({ type: 'message', data: message });
  }

  return result;
}

function mapBackendStatus(s?: 'SENT' | 'DELIVERED' | 'READ'): Message['status'] {
  if (s === 'READ') return 'read';
  if (s === 'DELIVERED') return 'delivered';
  if (s === 'SENT') return 'sent';
  return undefined;
}

function mapToMessage(dto: MessageHistoryDTO, currentUserEmail: string): Message {
  return {
    id: String(dto.id),
    content: dto.content,
    timestamp: dto.timestamp,
    senderName: dto.senderName,
    isMine: dto.senderEmail === currentUserEmail,
    typeMedia: dto.typeMedia,
    mediaUrl: dto.mediaUrl,
    status: mapBackendStatus(dto.status),
  };
}


export function useChatViewModel(
  conversationId: number,
  receiverId: number,
  initialIsOnline: boolean,
  initialLastSeen: string | null,
) {
  const [chatItems, setChatItems] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState({
    isOnline: initialIsOnline,
    lastSeen: initialLastSeen,
  });

  // Timer para parar de enviar "digitando" após 2s sem digitar
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer de segurança no receptor: reseta se o "parou de digitar" nunca chegar
  const typingResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs estáveis — evitam dependência circular com handleIncomingMessage
  const wsSendDeliveredRef = useRef<(chatId: number, messageId: number) => void>(() => {});
  const wsSendReadRef = useRef<(chatId: number) => void>(() => {});

  const currentUserEmail = useAuthStore((state) => state.user?.email);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentUserName = useAuthStore((state) => state.user?.displayName);
  const token = useAuthStore((state) => state.token);

  // ── 1a. Handler de mensagens recebidas ─────────────────────
  const handleIncomingMessage = useCallback<MessageHandler>((message) => {
      const isFromOtherUser = message.senderEmail !== currentUserEmail;

      if (!isFromOtherUser) {
        // Eco da própria mensagem: substitui o placeholder local pelo real do servidor
        setChatItems((prev) => {
          const localIdx = [...prev].reverse().findIndex(
            (item) => item.type === 'message' && item.data.id.startsWith('local-')
          );
          if (localIdx === -1) return prev;
          const realIdx = prev.length - 1 - localIdx;
          const updated = [...prev];
          updated[realIdx] = {
            type: 'message',
            data: {
              ...(updated[realIdx] as { type: 'message'; data: Message }).data,
              id: String(message.id),
              status: 'sent',
            },
          };
          return updated;
        });
        return;
      }

      const newMessage: Message = {
        id: String(message.id),
        content: message.content,
        timestamp: message.timestamp,
        senderName: message.senderName,
        isMine: false,
        typeMedia: message.typeMedia,
        mediaUrl: message.mediaUrl,
        status: mapBackendStatus(message.status),
      };

      setChatItems((prev) => {
        // Deduplicação: ignora se já existe mensagem com o mesmo id do servidor
        const alreadyExists = prev.some(
          (item) => item.type === 'message' && item.data.id === newMessage.id
        );
        if (alreadyExists) return prev;

        const todayKey = extractDateKey(newMessage.timestamp);
        const result = [...prev];

        const hasTodaySeparator = prev.some(
          (item) => item.type === 'separator' && item.key === `separator-${todayKey}`
        );

        if (!hasTodaySeparator) {
          result.push({
            type: 'separator',
            label: extractDateLabel(newMessage.timestamp),
            key: `separator-${todayKey}`,
          });
        }

        result.push({ type: 'message', data: newMessage });
        return result;
      });

      // Confirma entrega e depois marca como lido com delay para evitar race condition no backend
      console.log('[ViewModel] 📨 Mensagem recebida, disparando delivered+read | chatId=', message.chatId, '| msgId=', message.id);
      wsSendDeliveredRef.current(message.chatId, message.id);
      setTimeout(() => {
        wsSendReadRef.current(message.chatId);
      }, 400);
  }, [currentUserEmail]);

  // ── 1c. Handler de eventos de presença recebidos ───────────
  const handlePresenceUpdate = useCallback<PresenceHandler>((dto) => {
    console.log('[ViewModel] 📡 presença recebida via WS:', dto);
    // Quando o WS sinaliza offline, dto.lastSeen é o lastSeen da sessão anterior (stale).
    // Como sabemos que o usuário acabou de desconectar agora, usamos o timestamp atual.
    setPresenceStatus({
      isOnline: dto.isOnline,
      lastSeen: dto.isOnline ? dto.lastSeen : new Date().toISOString(),
    });
  }, []);

  // ── 1b. Handler de eventos de typing recebidos ─────────────
  const handleIncomingTyping = useCallback<TypingHandler>((dto) => {
    console.log('[ViewModel] handleIncomingTyping ←', dto, '| meuId=', currentUserId);

    if (dto.userId === currentUserId) {
      console.log('[ViewModel] typing ignorado (evento próprio)');
      return;
    }

    console.log('[ViewModel] isOtherUserTyping →', dto.typing);
    setIsOtherUserTyping(dto.typing);

    if (dto.typing) {
      if (typingResetRef.current) clearTimeout(typingResetRef.current);
      typingResetRef.current = setTimeout(() => {
        console.log('[ViewModel] typing reset por timeout de segurança (5s)');
        setIsOtherUserTyping(false);
      }, 5000);
    } else {
      if (typingResetRef.current) clearTimeout(typingResetRef.current);
    }
  }, [currentUserId]);

  // ── 1d. Busca presença atual via REST ao abrir o chat ─────
  // Necessário porque o snapshot de route.params pode estar stale:
  // o outro usuário pode ter conectado depois da última carga da ChatListScreen.
  useEffect(() => {
    async function refreshPresence() {
      try {
        const items = await fetchChatItemsList();
        const match = items.find((i) => i.otherUserId === receiverId);
        console.log('[ViewModel] 🔍 refresh presença REST | receiverId=', receiverId, '| match=', match ? { isOnline: match.isOnline, lastSeen: match.lastSeen } : 'não encontrado');
        if (match) {
          setPresenceStatus({ isOnline: match.isOnline, lastSeen: match.lastSeen });
        }
      } catch (err) {
        console.warn('[ViewModel] ⚠️ falha ao buscar presença via REST:', err);
      }
    }
    refreshPresence();
  }, [receiverId]);

  // ── 1d-bis. Handler de status update (DELIVERED / READ) ───
  const handleStatusUpdate = useCallback<StatusUpdateHandler>((dto) => {
    console.log('[ViewModel] 📬 status update recebido | dto=', dto, '| conversationId=', conversationId);
    setChatItems((prev) =>
      prev.map((item) => {
        if (item.type !== 'message' || !item.data.isMine) return item;
        if (dto.status === 'READ') {
          // messageId null = todas as mensagens do chat foram lidas
          if (dto.chatId === conversationId) {
            console.log('[ViewModel] ✅ Marcando mensagem como READ | id=', item.data.id);
            return { ...item, data: { ...item.data, status: 'read' as const } };
          } else {
            console.warn('[ViewModel] ⚠️ READ chatId mismatch | dto.chatId=', dto.chatId, '| conversationId=', conversationId);
          }
        } else if (dto.status === 'DELIVERED' && dto.messageId != null) {
          if (item.data.id === String(dto.messageId)) {
            console.log('[ViewModel] ✅ Marcando mensagem como DELIVERED | id=', item.data.id);
            return { ...item, data: { ...item.data, status: 'delivered' as const } };
          }
        }
        return item;
      })
    );
  }, [conversationId]);

  // ── 2. Passa os handlers estáveis para o hook ──────────────
  const { sendMessage: wsSendMessage, sendTyping: wsSendTyping, sendDelivered: wsSendDelivered, sendRead: wsSendRead } = useWebSocket({
    token: token ?? '',
    onMessage: handleIncomingMessage,
    chatId: conversationId,
    onTyping: handleIncomingTyping,
    otherUserId: receiverId,
    onPresence: handlePresenceUpdate,
    myUserId: currentUserId ?? undefined,
    onStatusUpdate: handleStatusUpdate,
  });

  // Mantém os refs de send* sempre atualizados
  useEffect(() => { wsSendDeliveredRef.current = wsSendDelivered; }, [wsSendDelivered]);
  useEffect(() => { wsSendReadRef.current = wsSendRead; }, [wsSendRead]);
    

  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      try {
        setIsLoading(true);
        const dtos = await fetchMessages(conversationId);
        const mapped = dtos.map((dto) => mapToMessage(dto, currentUserEmail ?? ''));
        const items = groupMessageWithSeparators(mapped);
        setChatItems(items);
      } catch (err) {
        setError('Erro ao carregar mensagens.');
      } finally {
        setIsLoading(false);
      }
    }
    loadMessages();
  }, [conversationId]);

  // ── Lida com mudança no input + debounce de typing ────────
  const handleInputChange = useCallback((text: string) => {
    console.log('[ViewModel] handleInputChange | text=', text, '| currentUserId=', currentUserId);
    setInputText(text);

    if (currentUserId == null) return;

    if (text.trim().length > 0) {
      console.log('[ViewModel] handleInputChange → enviando isTyping=true');
      wsSendTyping(currentUserId, true);

      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        console.log('[ViewModel] debounce expirou → enviando isTyping=false');
        wsSendTyping(currentUserId, false);
      }, 2000);
    } else {
      console.log('[ViewModel] input vazio → enviando isTyping=false');
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      wsSendTyping(currentUserId, false);
    }
  }, [currentUserId, conversationId, wsSendTyping]);

  // ── Envia mensagem ─────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    // Para o indicador de typing imediatamente ao enviar
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (currentUserId != null) wsSendTyping(currentUserId, false);

    /**
     * Otimismo de UI: adicionamos a mensagem na lista
     * ANTES de esperar confirmação do servidor.
     * Isso faz o app parecer mais rápido e responsivo.
     * Se o envio falhar, idealmente removeríamos — mas
     * por ora mantemos simples.
     */
    const newMessage: Message = {
      id: `local-${Date.now()}`,
      content: text,
      timestamp: formatNowToBackendFormat(),
      senderName: currentUserName ?? '',
      isMine: true,
      status: 'sending',
    };

    setChatItems((prev) => {
      const todayKey = extractDateKey(newMessage.timestamp);
      const result = [...prev];

      /**
       * Verifica se já existe um separador para hoje.
       * Se não existir, adiciona antes da mensagem.
       */
      const hasTodaySeparator = prev.some(
        (item) => item.type === 'separator' && item.key === `separator-${todayKey}`
      );

      if (!hasTodaySeparator) {
        result.push({
          type: 'separator',
          label: extractDateLabel(newMessage.timestamp),
          key: `separator-${todayKey}`,
        });
      }

      result.push({ type: 'message', data: newMessage });
      return result;
    });

    // Envia via WebSocket
    wsSendMessage(receiverId, text);

    //Limpa o input
    setInputText('');
  }, [inputText, receiverId, wsSendMessage, wsSendTyping, currentUserName, currentUserId, conversationId]);

  const handleAttach = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const typeMedia: MediaType = asset.type === 'video' ? 'VIDEO' : 'IMAGE';
    const localId = `local-media-${Date.now()}`;

    // Optimistic UI com URI local enquanto o upload acontece
    setChatItems((prev) => {
      const timestamp = formatNowToBackendFormat();
      const todayKey = extractDateKey(timestamp);
      const items = [...prev];
      const hasTodaySeparator = prev.some(
        (item) => item.type === 'separator' && item.key === `separator-${todayKey}`
      );
      if (!hasTodaySeparator) {
        items.push({
          type: 'separator',
          label: extractDateLabel(timestamp),
          key: `separator-${todayKey}`,
        });
      }
      items.push({
        type: 'message',
        data: {
          id: localId,
          content: 'Arquivo de mídia',
          timestamp,
          senderName: currentUserName ?? '',
          isMine: true,
          typeMedia,
          mediaUrl: asset.uri,
          status: 'sending',
        },
      });
      return items;
    });

    let savedMessage: MessageHistoryDTO | null = null;
    try {
      savedMessage = await uploadMedia(conversationId, asset, receiverId);
    } catch (err) {
      console.error('[ViewModel] ❌ Erro ao fazer upload de mídia:', err);
      setChatItems((prev) => prev.filter(
        (item) => !(item.type === 'message' && item.data.id === localId)
      ));
      setError('Erro ao enviar arquivo. Tente novamente.');
      return;
    }

    if (!savedMessage?.mediaUrl) {
      console.error('[ViewModel] ❌ Upload retornou sem mediaUrl:', savedMessage);
      setChatItems((prev) => prev.filter(
        (item) => !(item.type === 'message' && item.data.id === localId)
      ));
      setError('Erro ao processar arquivo. Tente novamente.');
      return;
    }

    // Substitui a URI local pela URL do servidor na mensagem otimista
    setChatItems((prev) =>
      prev.map((item) =>
        item.type === 'message' && item.data.id === localId
          ? { ...item, data: { ...item.data, mediaUrl: savedMessage!.mediaUrl } }
          : item
      )
    );
    // O backend já notifica todos os participantes via WebSocket ao processar o
    // upload REST — não enviamos wsSendMessage aqui para evitar mensagem duplicada.
  }, [conversationId, currentUserName, receiverId, wsSendMessage]);

  return {
    chatItems,
    inputText,
    setInputText: handleInputChange,
    handleSend,
    handleAttach,
    isLoading,
    error,
    isOtherUserTyping,
    presenceStatus,
  };
}