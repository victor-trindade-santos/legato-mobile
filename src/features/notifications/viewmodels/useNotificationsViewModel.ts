/**
 * useNotificationsViewModel — ViewModel (Notificações)
 * ══════════════════════════════════════════════════
 * CAMADA: ViewModel (MVVM)
 *
 * Responsabilidade:
 * - Buscar dados do servidor via TanStack Query
 * - Expor ações (markAsRead, markAllAsRead) via mutations
 * - Sincronizar estado derivado com o Zustand (badge da tab bar)
 * - Retornar uma interface limpa para a View consumir
 * - SEM JSX, SEM StyleSheet — apenas lógica pura
 *
 * ──────────────────────────────────────────────────
 * CONVENÇÃO DO PROJETO:
 *
 * useQuery → para leitura de dados (GET)
 *   - queryKey: identificador único do cache ['notifications']
 *   - queryFn: função do Service
 *   - onSuccess: efeito colateral após sucesso (ex: atualizar Zustand)
 *
 * useMutation → para escrita de dados (POST/PATCH/DELETE)
 *   - mutationFn: função do Service
 *   - onSuccess: invalida o cache para forçar refetch automático
 *
 * useQueryClient → para controle manual do cache TanStack Query
 *   - invalidateQueries: marca o cache como stale → refetch na próxima leitura
 *
 * useNotificationStore → Zustand store global
 *   - setUnreadCount: atualiza o badge da tab bar em MainNavigator
 * ──────────────────────────────────────────────────
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification } from '../models/Notification';

export function useNotificationsViewModel() {
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  // ── Query: busca notificações ──────────────────────────────
  const {
    data: notifications = [] as Notification[],
    isLoading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  // onSuccess foi removido no TanStack Query v5 — sincroniza badge via useEffect
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // ── Mutation: marcar uma notificação como lida ─────────────
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      // Invalida o cache → TanStack Query faz refetch automático
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // ── Mutation: marcar todas como lidas ─────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Zera o badge imediatamente (sem esperar o refetch)
      setUnreadCount(0);
    },
  });

  // ── Dado derivado ──────────────────────────────────────────
  // Calculado aqui para que a View não precise saber da estrutura do dado
  const hasUnread = notifications.some((n: Notification) => !n.read);

  // ── Interface exposta para a View ──────────────────────────
  return {
    notifications,
    isLoading,
    hasUnread,
    markAsRead: (id: number) => markReadMutation.mutate(id),
    markAllAsRead: () => markAllReadMutation.mutate(),
    refetch,
  };
}
