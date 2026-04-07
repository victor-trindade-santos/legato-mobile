/**
 * notificationRegistry — Config extensível de notificações
 *
 * Adicionar um novo tipo de notificação = adicionar UMA entrada aqui.
 * Nenhuma outra camada (View, ViewModel, NotificationItem) precisa mudar.
 *
 * getNavTarget: undefined → toca apenas marca como lida (tela ainda não existe)
 */

import { Colors } from '@/theme';
import type { Notification, NotificationType } from '../models/Notification';

export type NotificationAction = 'accept' | 'decline';

export interface NavTarget {
  screen: string;
  params?: Record<string, unknown>;
}

export interface NotificationConfig {
  icon: string;
  iconColor: string;
  actions: NotificationAction[];
  getNavTarget?: (n: Notification) => NavTarget;
}

export const NOTIFICATION_REGISTRY: Record<NotificationType, NotificationConfig> = {
  FOLLOW: {
    icon: 'person-add-outline',
    iconColor: Colors.primary,
    actions: [],
    getNavTarget: (n) => ({
      screen: 'MusicianProfile',
      params: { musicianId: n.targetId, displayName: n.senderName },
    }),
  },

  CONNECTION_REQUEST: {
    icon: 'people-outline',
    iconColor: Colors.primary,
    actions: ['accept', 'decline'],
    getNavTarget: (n) => ({
      screen: 'MusicianProfile',
      params: { musicianId: n.targetId, displayName: n.senderName },
    }),
  },

  CONNECTION_ACCEPTED: {
    icon: 'people-outline',
    iconColor: Colors.success,
    actions: [],
    getNavTarget: (n) => ({
      screen: 'MusicianProfile',
      params: { musicianId: n.targetId, displayName: n.senderName },
    }),
  },

  MESSAGE: {
    icon: 'chatbubble-outline',
    iconColor: Colors.info,
    actions: [],
    getNavTarget: (n) => ({
      screen: 'Main',
      params: {
        screen: 'ChatTab',
        params: { screen: 'Chat', params: { conversationId: n.targetId, userName: n.senderName, receiverId: n.targetId } },
      },
    }),
  },

  MATCH: {
    icon: 'heart',
    iconColor: Colors.error,
    actions: [],
    getNavTarget: (n) => ({
      screen: 'Main',
      params: {
        screen: 'ChatTab',
        params: { screen: 'Chat', params: { conversationId: n.targetId, userName: n.senderName, receiverId: n.targetId } },
      },
    }),
  },

  LIKE: {
    icon: 'heart-outline',
    iconColor: Colors.error,
    actions: [],
    getNavTarget: undefined, // Feed ainda não implementado
  },

  COMMENT: {
    icon: 'chatbox-outline',
    iconColor: Colors.warning,
    actions: [],
    getNavTarget: undefined, // Feed ainda não implementado
  },

  COLLABORATION_INVITE: {
    icon: 'musical-notes-outline',
    iconColor: Colors.success,
    actions: ['accept', 'decline'],
    getNavTarget: undefined, // Collaborations ainda não implementado
  },

  COLLABORATION_ACCEPTED: {
    icon: 'musical-notes-outline',
    iconColor: Colors.success,
    actions: [],
    getNavTarget: undefined, // Collaborations ainda não implementado
  },
};
