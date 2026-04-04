/**
 * useNotificationsViewModel — ViewModel (Notificações)
 *
 * - Busca e expõe notificações enriquecidas com config do registry
 * - handlePress: marca como lida + navega para a tela certa
 * - handleAction: aceita/recusa conexão/colaboração
 * - Sincroniza badge da tab bar via Zustand
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';
import { NOTIFICATION_REGISTRY } from '../config/notificationRegistry';
import type { NotificationAction } from '../config/notificationRegistry';
import type { Notification } from '../models/Notification';
import type { RootStackParamList } from '@/navigation/types';
import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';

type RootNav = StackNavigationProp<RootStackParamList>;

export function useNotificationsViewModel() {
  const navigation = useNavigation<RootNav>();
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  // ── Query ──────────────────────────────────────────────────
  const {
    data: notifications = [] as Notification[],
    isLoading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Sincroniza badge: dependência é o número (primitivo), não o array — evita loop infinito
  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  // ── Mutations ──────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
    },
  });

  // ── Handlers ───────────────────────────────────────────────

  /** Toca numa notificação: marca como lida e navega conforme o registry */
  const handlePress = (notification: Notification) => {
    if (!notification.read) markReadMutation.mutate(notification.id);

    const config = NOTIFICATION_REGISTRY[notification.type];
    const target = config?.getNavTarget?.(notification);
    if (target) {
      navigation.navigate(target.screen as keyof RootStackParamList, target.params as any);
    }
  };

  /** Ação inline (aceitar / recusar) em CONNECTION_REQUEST ou COLLABORATION_INVITE */
  const handleAction = (notification: Notification, action: NotificationAction) => {
    markReadMutation.mutate(notification.id);

    if (notification.type === 'CONNECTION_REQUEST') {
      const endpoint =
        action === 'accept'
          ? Endpoints.connections.accept(notification.targetId)
          : Endpoints.connections.decline(notification.targetId);
      api.post(endpoint).then(() =>
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      );
    }
    // COLLABORATION_INVITE: adicionar aqui quando o endpoint existir
  };

  // ── Enriquece cada notificação com a config do registry ────
  const enrichedNotifications = notifications.map((n) => ({
    notification: n,
    config: NOTIFICATION_REGISTRY[n.type] ?? {
      icon: 'notifications-outline',
      iconColor: '#888',
      actions: [],
    },
  }));

  return {
    enrichedNotifications,
    isLoading,
    hasUnread: notifications.some((n) => !n.read),
    handlePress,
    handleAction,
    markAllAsRead: () => markAllReadMutation.mutate(),
    refetch,
  };
}
