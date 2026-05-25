import type { MediaType } from '@/types/WebSocket.types';

export interface MessageContentProps {
  message: string;
  timestamp: string;
  typeMedia?: MediaType;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  thumbnailUrl?: string;

  /** Chamado ao tocar em uma imagem — recebe a URL para abrir no viewer */
  onImagePress?: (url: string) => void;

  /** Chamado ao tocar em um vídeo — recebe a URL para abrir no player */
  onVideoPress?: (url: string) => void;

  /** Ex: ✓, ✓✓, ✓✓ (azul) — entra depois via MessageStatusIndicator */
  statusElement?: React.ReactNode;
}