/**
 * notificationService.ts — Service (Notificações)
 * ══════════════════════════════════════════════════
 * CAMADA: Service (MVVM)
 *
 * Responsabilidade:
 * - Encapsular todas as chamadas HTTP desta feature
 * - Mapear endpoints para funções TypeScript tipadas
 * - Retornar dados puros (sem transformações complexas)
 * - SEM lógica de negócio, SEM estado, SEM efeitos colaterais de UI
 *
 * ──────────────────────────────────────────────────
 * CONVENÇÃO DO PROJETO:
 * - Sempre use a instância `api` de @/services/api/axios
 *   (ela injeta o JWT automaticamente via interceptor)
 * - Sempre use os endpoints de @/services/api/endpoints
 *   (evita strings mágicas espalhadas pelo código)
 * - Tipagem explícita no genérico do axios (api.get<Tipo>)
 * - Funções assíncronas retornam Promise com o tipo correto
 * ──────────────────────────────────────────────────
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { Notification } from '../models/Notification';

/**
 * Busca todas as notificações do usuário autenticado.
 * GET /notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  const res = await api.get<Notification[]>(Endpoints.notifications.list);
  return res.data;
}

/**
 * Marca uma notificação específica como lida.
 * PATCH /notifications/:id/read
 */
export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(Endpoints.notifications.markRead(id));
}

/**
 * Marca todas as notificações do usuário como lidas.
 * PATCH /notifications/read-all
 */
export async function markAllNotificationsRead(): Promise<void> {
  await api.patch(Endpoints.notifications.markAllRead);
}

/**
 * Retorna o total de notificações não lidas.
 * Usado para inicializar o badge da tab bar.
 * GET /notifications/unread-count
 */
export async function getUnreadCount(): Promise<number> {
  const res = await api.get<{ count: number }>(Endpoints.notifications.unreadCount);
  return res.data.count;
}
