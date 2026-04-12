import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';

interface DividerProps {
  color?: string;
  marginV?: number;
}

export function Divider({ color, marginV = Spacing.md }: DividerProps) {
  const colors = useColors();
  return <View style={[styles.line, { 
    backgroundColor: color ?? colors.border, 
    marginVertical: marginV }]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    width: '100%',
  },
});
