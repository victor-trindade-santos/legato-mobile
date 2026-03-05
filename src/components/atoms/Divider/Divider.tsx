import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/theme';

interface DividerProps {
  color?: string;
  marginV?: number;
}

export function Divider({ color = Colors.border, marginV = Spacing.md }: DividerProps) {
  return <View style={[styles.line, { backgroundColor: color, marginVertical: marginV }]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    width: '100%',
  },
});
