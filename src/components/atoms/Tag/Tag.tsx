/**
 * Tag — Atom
 * Chip de gênero musical, skill, ou qualquer label categorizado.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/theme';
import { LegatoText } from '../Text/Text';

interface TagProps {
  label: string;
  variant?: 'filled' | 'outline';
  color?: string;
}

export function Tag({ label, variant = 'filled', color = Colors.primary }: TagProps) {
  return (
    <View
      style={[
        styles.container,
        variant === 'filled'
          ? { backgroundColor: `${color}20` }
          : { borderWidth: 1, borderColor: color },
      ]}
    >
      <LegatoText style={[styles.label, { color }]}>{label}</LegatoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  label: {
    fontSize: Typography.FontSize.xxs,
    fontWeight: '600',
  },
});
