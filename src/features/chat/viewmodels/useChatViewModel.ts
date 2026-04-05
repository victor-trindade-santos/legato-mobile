
import { useEffect, useState, useCallback } from "react";
import { fetchMessages } from "../services/ChatService";
import type { Message, MessageHistoryDTO } from "@/features/chat/models/MessageModel";
import { useAuthStore } from "@/store/authStore";
import { extractDateKey, extractDateLabel, formatNowToBackendFormat } from "@/utils/dateUtils";
import { useWebSocket } from "@/hooks/useWebSocket";
import { set } from "react-hook-form";
import { MessageHandler } from "@/types/WebSocket.types";


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

  const currentUserEmail = useAuthStore((state) => state.user?.email);
  const currentUserName = useAuthStore((state) => state.user?.displayName);
  const token = useAuthStore((state) => state.token);

  // ── 1. Define o handler ANTES do useWebSocket ──────────────
  const handleIncomingMessage = useCallback<MessageHandler>((message) => {
     console.log('[useChatViewModel] 📨 handleIncomingMessage chamado!', message);
  console.log('[useChatViewModel] currentUserEmail:', currentUserEmail);
    /**
       *  O WebSocket já entrega apenas mensagens destinadas ao usuário atual.
       * Então qualquer mensagem que chegar aqui já é para esta conversa -
       * desde que não seja do próprio usuário (eco)
       */
      const isFromOtherUser = message.senderEmail !== currentUserEmail;
      console.log('[useChatViewModel] isFromOtherUser:', isFromOtherUser);

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
  }, [currentUserEmail]); // Só é recriado se o email mudar

    // ── 2. Passa o handler estável para o hook ─────────────────
  const { sendMessage: wsSendMessage } = useWebSocket({
    token: token ?? '',
    onMessage: handleIncomingMessage,
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

  // ── Envia mensagem ─────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

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
  }, [inputText, receiverId, wsSendMessage, currentUserName]);

  return {
    chatItems,
    inputText,
    setInputText,
    handleSend,
    isLoading,
    error,
  };
}