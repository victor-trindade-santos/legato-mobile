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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NotificationList } from './NotificationList';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Colors, Spacing } from '@/theme';
import { useNotificationsViewModel } from '../viewmodels/useNotificationsViewModel';

export default function NotificationsScreen() {
  const {
    enrichedNotifications,
    isLoading,
    hasUnread,
    handlePress,
    handleAction,
    markAllAsRead,
  } = useNotificationsViewModel();

  if (isLoading) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <LegatoText variant="subtitle" color={Colors.white}>
          Notificações
        </LegatoText>
        {hasUnread && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={18} color={Colors.primary} />
            <LegatoText variant="caption" color={Colors.primary}> Marcar todas</LegatoText>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Lista ──────────────────────────────────────────── */}
      <NotificationList
        items={enrichedNotifications}
        onPress={handlePress}
        onAction={handleAction}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.md,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
