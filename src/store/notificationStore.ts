/**
 * LEGATO — Notification Store (Zustand)
 *
 * Badge de notificações não lidas na Tab Bar.
 *
 * USO:
 *   const { unreadCount, setUnreadCount, incrementUnread, clearBadge } = useNotificationStore();
 */

import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;

  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  clearBadge: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  clearBadge: () => set({ unreadCount: 0 }),
}));
