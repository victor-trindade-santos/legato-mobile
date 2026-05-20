/**
 * NotificationItem — Molecule
 *
 * Renderiza um item de notificação com ícone, texto, tempo e ações inline.
 * Agnóstico ao tipo de notificação — recebe icon/color/actions como props
 * compostos pelo ViewModel via notificationRegistry.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { NotificationItemProps } from './NotificationItem.types';

export function NotificationItem({
  notification,
  icon,
  iconColor,
  actions,
  onPress,
  onAction,
  onDelete,
}: NotificationItemProps) {
  const colors = useColors();
  const { read, senderName, message, timeAgo } = notification;

  return (
    <TouchableOpacity
      style={[styles.container, !read && styles.unread]}
      onPress={() => onPress(notification)}
      activeOpacity={0.85}
    >
      {/* Avatar com ícone do tipo sobreposto */}
      <View style={styles.avatarWrapper}>
        <Avatar size="md" fallbackInitials={senderName} />
        <View style={[styles.iconBadge, { backgroundColor: iconColor, borderColor: colors.background }]}>
          <Ionicons name={icon as any} size={10} color={Colors.white} />
        </View>
      </View>

      <View style={styles.content}>
        <LegatoText variant="bodySmall" color={colors.textSecondary}>
          <LegatoText variant="bodyMedium" color={colors.textPrimary}>{senderName} </LegatoText>
          {message}
        </LegatoText>

        <LegatoText variant="caption" color={Colors.textMuted} style={styles.time}>
          {timeAgo}
        </LegatoText>

        {actions.length > 0 && !read && (
          <View style={styles.actions}>
            {actions.includes('accept') && (
              <Button
                label="Aceitar"
                variant="primary"
                size="sm"
                onPress={() => onAction(notification, 'accept')}
                style={styles.actionBtn}
              />
            )}
            {actions.includes('decline') && (
              <Button
                label="Recusar"
                variant="outline"
                size="sm"
                onPress={() => onAction(notification, 'decline')}
                style={styles.actionBtn}
              />
            )}
          </View>
        )}
      </View>

      <TouchableOpacity onPress={() => onDelete(notification.id)} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
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
    borderLeftWidth: 5,
    borderLeftColor: Colors.textMuted,
  },
  unread: {
    backgroundColor: Colors.primaryMuted,
    borderLeftColor: Colors.success,
  },
  avatarWrapper: {
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
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
});
