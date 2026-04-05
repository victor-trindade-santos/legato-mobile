export interface MessageContentProps {
  message: string;
  timestamp: string;

  /** Ex: ✓, ✓✓, ✓✓ (azul) — entra depois via MessageStatusIndicator */
  statusElement?: React.ReactNode;
}