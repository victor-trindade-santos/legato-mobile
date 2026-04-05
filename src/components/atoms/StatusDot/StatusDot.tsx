import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import type { StatusDotProps, StatusDotVariant } from './StatusDot.types';

const VARIANT_COLOR: Record<StatusDotVariant, string> = {
  online: Colors.success,
  offline: Colors.textMuted,
  away: Colors.warning,
  busy: Colors.error,
};

export function StatusDot({
  size = 10,
  variant = 'offline',
}: StatusDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: VARIANT_COLOR[variant],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    alignSelf: 'flex-start',
  },
});