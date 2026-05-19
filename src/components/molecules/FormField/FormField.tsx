/**
 * FormField — Molecule
 * Label + Input + Mensagem de erro.
 * Usado em LoginScreen, SignupScreen, ResetPasswordScreen.
 *
 * USO:
 *   <FormField label="Email" errorMessage={errors.email?.message} {...register('email')} />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '@/components/atoms/Input/Input';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, Typography } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { FormFieldProps } from './FormField.types';

export function FormField({
  label,
  errorMessage,
  hintMessage,
  isRequired,
  style,
  containerStyle,
  variant,
  editable,
  ...inputProps }: FormFieldProps) {
  const colors = useColors();
  const isDisabled = editable === false;
  const labelColor = colors.textSecondary;

  return (
    <View style={[styles.container, containerStyle]}>
      <LegatoText variant="label" color={labelColor} style={styles.label}>
        {label}{isRequired && ' *'}
      </LegatoText>
      <Input
        hasError={!!errorMessage}
        variant={variant}
        editable={editable}
        {...inputProps}
      />
      {errorMessage && (
        <LegatoText style={styles.error}>{errorMessage}</LegatoText>
      )}
      {hintMessage && !errorMessage && (
        <LegatoText style={styles.hint}>{hintMessage}</LegatoText>
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
  error: {
    marginTop: 4,
    fontSize: Typography.FontSize.xs,
    color: Colors.error,
  },
  hint: {
    marginTop: 4,
    fontSize: Typography.FontSize.xs,
    color: Colors.textMuted,
  },
});
