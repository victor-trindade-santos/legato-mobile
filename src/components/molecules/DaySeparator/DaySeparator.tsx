import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { DaySeparatorProps } from './DaySeparator.types';

export function DaySeparator({ label }: DaySeparatorProps) {
  return (
    <View style={styles.container}>
      <Divider marginV={0} />

      <View style={styles.labelContainer}>
        <LegatoText
          variant="overline"
          color={Colors.textMuted}
          align="center"
        >
          {label}
        </LegatoText>
      </View>

      <Divider marginV={0} />
      <Spacer size={Spacing.sm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
  },
});