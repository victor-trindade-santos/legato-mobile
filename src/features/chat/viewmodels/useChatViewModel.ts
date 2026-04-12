
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMessages } from "../services/ChatService";
import type { Message, MessageHistoryDTO } from "@/features/chat/models/MessageModel";
import { useAuthStore } from "@/store/authStore";
import { extractDateKey, extractDateLabel, formatNowToBackendFormat } from "@/utils/dateUtils";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { MessageHandler, TypingHandler } from "@/types/WebSocket.types";


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

function mapToMessage(dto: MessageHistoryDTO, currentUserEmail: string): Message {

  return {
    id: String(dto.id),
    content: dto.content,
    timestamp: dto.timestamp,
    senderName: dto.senderName,
    isMine: dto.senderEmail === currentUserEmail,
  };
}


export function useChatViewModel(conversationId: number, receiverId: number) {
  const [chatItems, setChatItems] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  // Timer para parar de enviar "digitando" após 2s sem digitar
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer de segurança no receptor: reseta se o "parou de digitar" nunca chegar
  const typingResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserEmail = useAuthStore((state) => state.user?.email);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentUserName = useAuthStore((state) => state.user?.displayName);
  const token = useAuthStore((state) => state.token);

  // ── 1a. Handler de mensagens recebidas ─────────────────────
  const handleIncomingMessage = useCallback<MessageHandler>((message) => {
    /**
       *  O WebSocket já entrega apenas mensagens destinadas ao usuário atual.
       * Então qualquer mensagem que chegar aqui já é para esta conversa -
       * desde que não seja do próprio usuário (eco)
       */
      const isFromOtherUser = message.senderEmail !== currentUserEmail;

      if (!isFromOtherUser) return; // Ignora mensagens enviadas por mim mesmo (eco)

      const newMessage: Message = {
        id: String(message.id),
        content: message.content,
        timestamp: message.timestamp,
        senderName: message.senderName,
        isMine: false, // Como o filtro acima garante que não é do usuário, podemos assumir isMine = false
      };

      setChatItems((prev) => {
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
      })
  }, [currentUserEmail]);

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

  // ── 2. Passa os handlers estáveis para o hook ──────────────
  const { sendMessage: wsSendMessage, sendTyping: wsSendTyping } = useWebSocket({
    token: token ?? '',
    onMessage: handleIncomingMessage,
    chatId: conversationId,
    onTyping: handleIncomingTyping,
  });
    

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
      wsSendTyping(conversationId, currentUserId, true);

      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        console.log('[ViewModel] debounce expirou → enviando isTyping=false');
        wsSendTyping(conversationId, currentUserId, false);
      }, 2000);
    } else {
      console.log('[ViewModel] input vazio → enviando isTyping=false');
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      wsSendTyping(conversationId, currentUserId, false);
    }
  }, [currentUserId, conversationId, wsSendTyping]);

  // ── Envia mensagem ─────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    // Para o indicador de typing imediatamente ao enviar
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (currentUserId != null) wsSendTyping(conversationId, currentUserId, false);

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
    };

    setChatItems((prev) => {
      const lastItem = prev[prev.length - 1];
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

  return {
    chatItems,
    inputText,
    setInputText: handleInputChange,
    handleSend,
    isLoading,
    error,
    isOtherUserTyping,
  };
}