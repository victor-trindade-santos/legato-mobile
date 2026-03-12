/**
 * CollaborationsScreen — PLACEHOLDER
 * TODO: Implementar (JAMs / Colaborações)
 * Referência: frontend/src/app/(main)/colaborations/page.tsx
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
export default function CollaborationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LegatoText variant="subtitle" color={Colors.white} align="center">JAMs / Colaborações</LegatoText>
        <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">Em desenvolvimento</LegatoText>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
});
