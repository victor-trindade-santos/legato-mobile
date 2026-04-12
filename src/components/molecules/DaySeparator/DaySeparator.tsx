import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';

import { LegatoText } from '@/components/atoms/Text/Text';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { DaySeparatorProps } from './DaySeparator.types';

export function DaySeparator({ label }: DaySeparatorProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.labelContainer, { backgroundColor: colors.surface }]}>
        <LegatoText
          variant="caption"
          align="center"
        >
          {label}
        </LegatoText>
      </View>
      <Spacer size={Spacing.sm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
});