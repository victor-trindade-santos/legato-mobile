/**
 * UnreadMessagesBadge — Molecule
 *
 * Indicador de status de entrega/leitura da mensagem.
 *
 * NÃO é contador de não lidas.
 *
 * Representa os 4 estados clássicos de chat:
 *
 *  ⏳ sending
 *  ✓ sent
 *  ✓✓ delivered
 *  ✓✓ read
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/theme';

import { LegatoText } from '@/components/atoms/Text/Text';
import type { UnreadMessagesBadgeProps } from './UnreadMessagesBadge.types';

export function UnreadMessagesBadge({ status }: UnreadMessagesBadgeProps) {
  const renderIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <Ionicons
            name="time-outline"
            size={Spacing.iconSm}
            color={Colors.textMuted}
          />
        );

      case 'sent':
        return (
          <Ionicons
            name="checkmark"
            size={Spacing.iconSm}
            color={Colors.textMuted}
          />
        );

      case 'delivered':
        return (
          <View style={styles.row}>
            <Ionicons
              name="checkmark"
              size={Spacing.iconSm}
              color={Colors.textMuted}
            />
            <Ionicons
              name="checkmark"
              size={Spacing.iconSm}
              color={Colors.textMuted}
              style={styles.secondCheck}
            />
          </View>
        );

      case 'read':
        return (
          <View style={styles.row}>
            <Ionicons
              name="checkmark"
              size={Spacing.iconSm}
              color={Colors.primary}
            />
            <Ionicons
              name="checkmark"
              size={Spacing.iconSm}
              color={Colors.primary}
              style={styles.secondCheck}
            />
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
  container: {
    marginLeft: Spacing.xs,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  secondCheck: {
    marginLeft: -4,
  },
});