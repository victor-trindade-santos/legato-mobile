/**
 * NotificationItem — Molecule
 * Item individual de notificação com avatar, texto, tempo e ações.
 * Fundo levemente roxo para notificações não lidas (igual ao web).
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { NotificationItemProps } from './NotificationItem.types';

export function NotificationItem({
  notification,
  onMarkRead,
  onAccept,
  onDecline,
  onPress,
}: NotificationItemProps) {
  const { id, type, userAvatar, userName, text, time, read } = notification;
  const isConnection = type === 'connection';

  return (
    <TouchableOpacity
      style={[styles.container, !read && styles.unread]}
      onPress={() => {
        onMarkRead(id);
        onPress?.(notification);
      }}
      activeOpacity={0.85}
    >
      <Avatar uri={userAvatar} size="md" fallbackInitials={userName} />
      <View style={styles.content}>
        <LegatoText variant="bodySmall" color={Colors.textPrimaryDark}>
          <LegatoText variant="bodyMedium" color={Colors.white}>{userName} </LegatoText>
          {text}
        </LegatoText>
        <LegatoText variant="caption" color={Colors.textMuted} style={styles.time}>
          {time}
        </LegatoText>
        {isConnection && !read && (
          <View style={styles.actions}>
            <Button
              label="Aceitar"
              variant="primary"
              size="sm"
              onPress={() => { onAccept?.(id); onMarkRead(id); }}
              style={styles.actionBtn}
            />
            <Button
              label="Recusar"
              variant="outline"
              size="sm"
              onPress={() => { onDecline?.(id); onMarkRead(id); }}
              style={styles.actionBtn}
            />
          </View>
        )}
      </View>
      {!read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  unread: {
    backgroundColor: Colors.primaryMuted,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  time: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    marginTop: Spacing.xs,
  },
});
