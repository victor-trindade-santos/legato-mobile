import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '@/components/molecules/NotificationItem/NotificationItem';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import type { NotificationListProps } from './NotificationList.types';
import type { NotificationData } from '@/components/molecules/NotificationItem/NotificationItem.types';

export function NotificationList({
  notifications,
  onMarkRead,
  onAccept,
  onDecline,
}: NotificationListProps) {
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item: NotificationData) => String(item.id)}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onMarkRead={onMarkRead}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.textMuted} />
          <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
            Nenhuma notificação por aqui
          </LegatoText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.xxxl,
  },
});
