import type { NotificationData } from '@/components/molecules/NotificationItem/NotificationItem.types';

export interface NotificationListProps {
  /** Lista de notificações recebida do ViewModel via View */
  notifications: NotificationData[];

  /** Callback chamado ao tocar em qualquer item (marca como lida) */
  onMarkRead: (id: number) => void;

  /** Callback para notificações de tipo 'connection' — aceitar pedido */
  onAccept?: (id: number) => void;

  /** Callback para notificações de tipo 'connection' — recusar pedido */
  onDecline?: (id: number) => void;
}
