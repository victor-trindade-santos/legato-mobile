/**
 * ProfileScreen — PLACEHOLDER
 * TODO: Implementar por Felipe Selva Rocha Alves
 * Referência: frontend/src/app/(main)/users/[username]/page.tsx
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LegatoText variant="subtitle" color={Colors.white} align="center">Perfil</LegatoText>
        <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
          Em desenvolvimento — Felipe
        </LegatoText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
});
