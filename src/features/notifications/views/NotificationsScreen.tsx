/**
 * NotificationsScreen — View (Notificações)
 *
 * Conecta o ViewModel aos componentes visuais.
 * Sem lógica de negócio — apenas layout e repasse de dados.
 *
 * Fluxo:
 *   API → notificationService → useNotificationsViewModel
 *     → NotificationsScreen → NotificationList → NotificationItem
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationList } from './NotificationList';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { Colors, Spacing } from '@/theme';
import { useNotificationsViewModel } from '../viewmodels/useNotificationsViewModel';

export default function NotificationsScreen() {
  const {
    enrichedNotifications,
    isLoading,
    hasUnread,
    handlePress,
    handleAction,
    handleDelete,
    markAllAsRead,
  } = useNotificationsViewModel();

  const isEmpty = !isLoading && enrichedNotifications.length === 0;

  return (
    <AppTemplate noPadding>

      {isLoading ? (
        <Spinner fullScreen />
      ) : (
        <>
          {/* ── Ação "Marcar todas" ───────────────────────────── */}
          {hasUnread && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Ionicons name="checkmark-done" size={18} color={Colors.primary} />
              <LegatoText variant="caption" color={Colors.primary}> Marcar todas</LegatoText>
            </TouchableOpacity>
          )}

          {/* ── Empty state ───────────────────────────────────── */}
          {isEmpty ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={Spacing.iconXxl} color={Colors.textMuted} />
              <LegatoText variant="subtitle" color={Colors.textMuted} align="center">
                Sem notificações
              </LegatoText>
              <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
                Quando você interagir com outros músicos, as notificações aparecerão aqui.
              </LegatoText>
            </View>
          ) : (
            <NotificationList
              items={enrichedNotifications}
              onPress={handlePress}
              onAction={handleAction}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});
