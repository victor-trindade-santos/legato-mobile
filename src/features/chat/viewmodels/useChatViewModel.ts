
import { useEffect, useState } from "react";
import { fetchMessages } from "../services/ChatService";
import type { Message, MessageHistoryDTO } from "@/features/chat/models/MessageModel";
import { useAuthStore } from "@/store/authStore";
import { extractDateKey, extractDateLabel} from "@/utils/dateUtils";


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


export function useChatViewModel(conversationId: number) {
  const [chatItems, setChatItems] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = useAuthStore((state) => state.user?.email);

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



  return {
    chatItems,
    isLoading,
    error,
  };
}