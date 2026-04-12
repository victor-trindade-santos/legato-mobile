/**
 * FeedScreen — Stub
 * Tela em desenvolvimento.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';

export default function FeedScreen() {
  const colors = useColors();

  return (
    <AppTemplate>
      <View style={styles.content}>
        <Ionicons name="newspaper-outline" size={Spacing.iconXxl} color={Colors.textMuted} />
        <LegatoText variant="subtitle" color={colors.textPrimary} align="center">
          Feed
        </LegatoText>
        <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
          Esta tela está em desenvolvimento.
        </LegatoText>
      </View>
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
