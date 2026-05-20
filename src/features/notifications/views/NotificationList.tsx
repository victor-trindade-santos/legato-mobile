import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '@/components/molecules/NotificationItem/NotificationItem';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import type { NotificationListProps, EnrichedNotification } from './NotificationList.types';

export function NotificationList({ items, onPress, onAction, onDelete }: NotificationListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item: EnrichedNotification) => String(item.notification.id)}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item.notification}
          icon={item.config.icon}
          iconColor={item.config.iconColor}
          actions={item.config.actions}
          onPress={onPress}
          onAction={onAction}
          onDelete={onDelete}
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
