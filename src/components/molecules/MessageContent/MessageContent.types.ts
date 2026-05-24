import type { MediaType } from '@/types/WebSocket.types';

export interface MessageContentProps {
  message: string;
  timestamp: string;
  typeMedia?: MediaType;
  mediaUrl?: string;

  /** Ex: ✓, ✓✓, ✓✓ (azul) — entra depois via MessageStatusIndicator */
  statusElement?: React.ReactNode;
}