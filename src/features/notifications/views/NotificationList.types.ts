import type { Notification } from '../models/Notification';
import type { NotificationConfig, NotificationAction } from '../config/notificationRegistry';

export interface EnrichedNotification {
  notification: Notification;
  config: NotificationConfig;
}

export interface NotificationListProps {
  items: EnrichedNotification[];
  onPress: (notification: Notification) => void;
  onAction: (notification: Notification, action: NotificationAction) => void;
}
