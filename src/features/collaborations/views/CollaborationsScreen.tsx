/**
 * CollaborationsScreen — PLACEHOLDER
 * TODO: Implementar (JAMs / Colaborações)
 * Referência: frontend/src/app/(main)/colaborations/page.tsx
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LegatoText } from '@/components/atoms/Text/Text';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { useColors } from '@/hooks/useColors';
import { Spacing } from '@/theme';
import { Colors } from '@/theme';

export default function CollaborationsScreen() {
  const colors = useColors();
  return (
    <AppTemplate>
      <View style={styles.content}>
        <LegatoText variant="subtitle" color={colors.textPrimary} align="center">JAMs / Colaborações</LegatoText>
        <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">Em desenvolvimento</LegatoText>
      </View>
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
});
