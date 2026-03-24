/**
 * DateInput — Molecule
 *
 * Campo de data com máscara automática no formato MM/DD/AAAA.
 * Formata enquanto o usuário digita — apenas dígitos são aceitos,
 * as barras são inseridas automaticamente nas posições corretas.
 *
 * Suporta variant light (auth) e dark (telas do app).
 * Padrão visual idêntico ao FormField + Input para consistência.
 *
 * USO:
 *   <DateInput
 *     label="Data de Nascimento"
 *     value={value}
 *     onChange={onChange}
 *     errorMessage={errors.birthDate?.message}
 *   />
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import type { DateInputProps } from './DateInput.types';

const THEME = {
  light: {
    background: Colors.surfaceLight,
    border: Colors.borderLight,
    text: Colors.textPrimaryLight,
    label: Colors.textSecondaryLight,
  },
  dark: {
    background: Colors.surfaceDark,
    border: Colors.border,
    text: Colors.white,
    label: Colors.textSecondaryDark,
  },
};

/** Aplica a máscara MM/DD/AAAA mantendo apenas dígitos */
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').substring(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateInput({
  label,
  value,
  onChange,
  errorMessage,
  variant = 'light',
  containerStyle,
}: DateInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const theme = THEME[variant];

  const handleChange = (text: string) => {
    onChange(maskDate(text));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <LegatoText variant="label" color={theme.label} style={styles.label}>
        {label}
      </LegatoText>

      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.background, borderColor: theme.border },
          isFocused && styles.focused,
          !!errorMessage && styles.hasError,
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }, { outline: 'none' } as any]}
          value={value}
          onChangeText={handleChange}
          placeholder="MÊS/DIA/ANO"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
          maxLength={10}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
        />
        <Ionicons name="calendar-outline" size={Spacing.iconMd} color={Colors.textMuted} />
      </View>

      {errorMessage && (
        <LegatoText style={styles.errorText}>{errorMessage}</LegatoText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.inputPaddingH,
    height: Spacing.buttonHeightMd,
  },
  focused: {
    borderColor: Colors.primary,
  },
  hasError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    marginTop: 4,
    fontSize: Typography.FontSize.xs,
    color: Colors.error,
  },
});
