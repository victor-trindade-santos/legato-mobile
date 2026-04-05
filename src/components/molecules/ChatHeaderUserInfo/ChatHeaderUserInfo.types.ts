import type { StatusDotVariant } from '@/components/atoms/StatusDot/StatusDot.types';

export interface ChatHeaderUserInfoProps {
  avatarUri?: string;
  fallbackInitials: string;

  name: string;
  // statusText: string; // "online", "digitando...", "visto por último às 14:32"

  // statusVariant?: StatusDotVariant;
}