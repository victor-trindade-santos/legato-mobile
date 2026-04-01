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
import type { NotificationItemProps } from './NotificationItem.types';

export function NotificationItem({
  notification,
  icon,
  iconColor,
  actions,
  onPress,
  onAction,
}: NotificationItemProps) {
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
        <View style={[styles.iconBadge, { backgroundColor: iconColor }]}>
          <Ionicons name={icon as any} size={10} color={Colors.white} />
        </View>
      </View>

      <View style={styles.content}>
        <LegatoText variant="bodySmall" color={Colors.textPrimaryDark}>
          <LegatoText variant="bodyMedium" color={Colors.white}>{senderName} </LegatoText>
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
    borderColor: Colors.backgroundDark,
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
