import React from 'react';
import { View } from 'react-native';
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
