
import { useEffect, useState } from "react";
import { fetchMessages } from "../services/ChatService";
import type { Message, MessageHistoryDTO } from "@/features/chat/models/MessageModel";
import { useAuthStore } from "@/store/authStore";
import { set } from "react-hook-form";

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
  const [messages, setMessages] = useState<Message[]>([]);
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
        setMessages(mapped);
      } catch (err) {
        setError('Erro ao carregar mensagens.');
      } finally {
        setIsLoading(false);
      }
    }
    loadMessages();
  }, [conversationId]);

  return {
    messages,
    isLoading,
    error,
  };
}