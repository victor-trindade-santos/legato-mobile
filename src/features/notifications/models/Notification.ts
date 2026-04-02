/**
 * Notification.ts — Model (Notificações)
 *
 * NotificationDTO   → contrato exato do backend (GET /notifications)
 * Notification      → modelo interno usado na View/ViewModel
 */

/** Tipos retornados pelo backend (UPPERCASE) */
export type NotificationType =
  | 'FOLLOW'
  | 'CONNECTION_REQUEST'
  | 'CONNECTION_ACCEPTED'
  | 'LIKE'
  | 'COMMENT'
  | 'MESSAGE'
  | 'COLLABORATION_INVITE'
  | 'COLLABORATION_ACCEPTED';

/** Entidade-alvo da notificação — direciona a navegação */
export type TargetType = 'USER' | 'POST' | 'CHAT' | 'COLLABORATION';

/** DTO bruto retornado pelo backend em GET /notifications */
export interface NotificationDTO {
  id: number;
  senderName: string;
  recipientName: string;
  message: string;
  read: boolean;
  timeAgo: string;
  type: NotificationType;
  targetType: TargetType;
  targetId: number;
}

/** Envelope padrão do backend */
export interface NotificationsEnvelope {
  success: boolean;
  message: string;
  data: NotificationDTO[];
}

/** Modelo interno — campos mapeados e prontos para a View */
export interface Notification {
  id: number;
  type: NotificationType;
  senderName: string;
  message: string;
  read: boolean;
  timeAgo: string;
  targetType: TargetType;
  targetId: number;
}
