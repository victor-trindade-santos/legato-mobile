import type { Notification } from '@/features/notifications/models/Notification';
import type { NotificationAction } from '@/features/notifications/config/notificationRegistry';

export interface NotificationItemProps {
  notification: Notification;
  /** Ícone Ionicons — fornecido pelo registry via ViewModel */
  icon: string;
  iconColor: string;
  /** Ações inline disponíveis para este tipo (ex: ['accept', 'decline']) */
  actions: NotificationAction[];
  onPress: (notification: Notification) => void;
  onAction: (notification: Notification, action: NotificationAction) => void;
  onDelete: (id: number) => void;
}
