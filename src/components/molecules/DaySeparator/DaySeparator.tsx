import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/theme';

import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { DaySeparatorProps } from './DaySeparator.types';

export function DaySeparator({ label }: DaySeparatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <LegatoText
          variant="caption"
          color={Colors.white}
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
    backgroundColor: Colors.textSecondaryLight,
    borderRadius: BorderRadius.pill
  },
});