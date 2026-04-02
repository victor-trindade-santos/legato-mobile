import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { OptionChipsProps } from './OptionChips.types';

export function OptionChips({ options, value, onChange, label }: OptionChipsProps) {
  return (
    <View style={styles.wrapper}>
      {label && (
        <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.label}>
          {label}
        </LegatoText>
      )}
      <View style={styles.row}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.75}
            >
              <LegatoText
                variant="caption"
                color={active ? Colors.white : Colors.textMuted}
              >
                {opt.label}
              </LegatoText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  label: {
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
