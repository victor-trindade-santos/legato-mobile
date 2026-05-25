import type { MediaType } from '@/types/WebSocket.types';

export interface MessageContentProps {
  message: string;
  timestamp: string;
  typeMedia?: MediaType;
  mediaUrl?: string;

  /** Chamado ao tocar em uma imagem — recebe a URL para abrir no viewer */
  onImagePress?: (url: string) => void;

  /** Ex: ✓, ✓✓, ✓✓ (azul) — entra depois via MessageStatusIndicator */
  statusElement?: React.ReactNode;
}