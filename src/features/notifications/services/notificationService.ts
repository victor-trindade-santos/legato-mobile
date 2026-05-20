/**
 * notificationService — Service (Notificações)
 *
 * Desembrulha o envelope { success, message, data } do backend
 * e mapeia NotificationDTO → Notification (modelo interno).
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { Notification, NotificationDTO, NotificationsEnvelope } from '../models/Notification';

function mapDTO(dto: NotificationDTO): Notification {
  return {
    id: dto.id,
    type: dto.type,
    senderName: dto.senderName,
    title: dto.title,
    message: dto.message,
    read: dto.read,
    timeAgo: dto.timeAgo,
    targetType: dto.targetType,
    targetId: dto.targetId,
  };
}

/** GET /notifications */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const res = await api.get<NotificationsEnvelope>(Endpoints.notifications.list);
    const raw = res.data.data;
    if (!Array.isArray(raw)) return [];
    return raw.map(mapDTO);
  } catch {
    return [];
  }
}

/** PATCH /notifications/:id/read */
export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(Endpoints.notifications.markRead(id));
}

/** PATCH /notifications/read-all */
export async function markAllNotificationsRead(): Promise<void> {
  await api.patch(Endpoints.notifications.markAllRead);
}

/** DELETE /notifications/:id */
export async function deleteNotification(id: number): Promise<void> {
  await api.delete(Endpoints.notifications.delete(id));
}

/** GET /notifications/unread-count */
export async function getUnreadCount(): Promise<number> {
  const res = await api.get<{ success?: boolean; data?: { count: number } | number; count?: number }>(
    Endpoints.notifications.unreadCount,
  );
  // Suporta envelope { data: { count } } e resposta flat { count }
  const data = res.data;
  if (typeof data.data === 'number') return data.data;
  if (typeof (data.data as any)?.count === 'number') return (data.data as any).count;
  return data.count ?? 0;
}
