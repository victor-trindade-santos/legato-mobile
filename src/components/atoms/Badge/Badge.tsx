/**
 * Badge — Atom
 * Contador numérico para notificações, mensagens, etc.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography } from '@/theme';
import { LegatoText } from '../Text/Text';

interface BadgeProps {
  count: number;
  max?: number;
  color?: string;
}

export function Badge({ count, max = 99, color = Colors.error }: BadgeProps) {
  if (count <= 0) return null;
  const label = count > max ? `${max}+` : String(count);
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <LegatoText style={styles.text}>{label}</LegatoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontSize: Typography.FontSize.xxs,
    color: Colors.white,
    fontWeight: '700',
  },
});
