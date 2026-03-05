export type NotificationType = 'follow' | 'comment' | 'connection' | 'like' | 'mention';

export interface NotificationData {
  id: number;
  type: NotificationType;
  userName: string;
  userAvatar?: string;
  text: string;
  link?: string;
  read: boolean;
  time: string;
}

export interface NotificationItemProps {
  notification: NotificationData;
  onMarkRead: (id: number) => void;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
  onPress?: (notification: NotificationData) => void;
}
