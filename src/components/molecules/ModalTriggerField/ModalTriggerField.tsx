/**
 * ModalTriggerField — Molecule
 *
 * Campo que parece um Input mas abre um modal ao ser tocado.
 * Visual idêntico ao FormField: label externo + caixa com altura fixa.
 *
 * Reutilizável sempre que um campo precisar abrir qualquer modal
 * (bio, objetivo, endereço detalhado, etc.).
 *
 * USO:
 *   <ModalTriggerField
 *     label="Bio & Objetivo"
 *     value={bioValue}
 *     placeholder="Toque para adicionar sua bio..."
 *     onPress={openBioObjectiveModal}
 *     variant="dark"
 *   />
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import { useColors } from '@/hooks/useColors';
import type { ModalTriggerFieldProps } from './ModalTriggerField.types';

const THEME = {
  light: {
    background: Colors.surfaceLight,
    border: Colors.borderLight,
    text: Colors.textPrimaryLight,
  },
  dark: {
    background: Colors.surfaceDark,
    border: Colors.border,
    text: Colors.white,
  },
};

export function ModalTriggerField({
  label,
  value,
  placeholder = 'Toque para editar...',
  onPress,
  variant,
}: ModalTriggerFieldProps) {
  const storeTheme = useUIStore((s) => s.theme);
  const resolvedVariant = variant ?? (storeTheme === 'dark' ? 'dark' : 'light');
  const theme = THEME[resolvedVariant];
  const colors = useColors();
  const hasValue = !!value?.trim();

  return (
    <View style={styles.wrapper}>
      <LegatoText variant="label" color={colors.textSecondary} style={styles.label}>
        {label}
      </LegatoText>

      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <LegatoText
          variant="bodySmall"
          color={hasValue ? theme.text : Colors.textMuted}
          style={styles.text}
          numberOfLines={1}
        >
          {hasValue ? value : placeholder}
        </LegatoText>
        <Ionicons name="pencil-outline" size={Spacing.iconSm} color={Colors.primaryLight} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    letterSpacing: 0.8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.inputPaddingH,
    height: Spacing.buttonHeightMd,
  },
  text: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
    marginRight: Spacing.xs,
  },
});
