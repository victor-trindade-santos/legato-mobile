import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
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
  const { unreadCount, setUnreadCount } = useNotificationStore();

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

  // Refetch ao focar na aba — badge sempre sincronizado ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Sincroniza badge com a contagem real vinda do servidor após cada refetch
  const serverUnreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    setUnreadCount(serverUnreadCount);
  }, [serverUnreadCount, setUnreadCount]);

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

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // ── Handlers ───────────────────────────────────────────────

  /** Toca numa notificação: atualiza badge na hora + marca lida + navega */
  const handlePress = (notification: Notification) => {
    if (!notification.read) {
      setUnreadCount(Math.max(0, unreadCount - 1));
      markReadMutation.mutate(notification.id);
    }

    const config = NOTIFICATION_REGISTRY[notification.type];
    const target = config?.getNavTarget?.(notification);

    if (target) {
      navigation.dispatch(
        CommonActions.navigate({ name: target.screen, params: target.params }),
      );
    }
  };

  /** Exclui notificação: se não lida, já desconta do badge na hora */
  const handleDelete = (id: number) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif && !notif.read) {
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    deleteMutation.mutate(id);
  };

  /** Ação inline (aceitar / recusar) em CONNECTION_REQUEST ou COLLABORATION_INVITE */
  const handleAction = (notification: Notification, action: NotificationAction) => {
    if (!notification.read) {
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
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
    hasUnread: unreadCount > 0,
    handlePress,
    handleAction,
    handleDelete,
    markAllAsRead: () => {
      setUnreadCount(0); // otimista
      markAllReadMutation.mutate();
    },
    refetch,
  };
}
