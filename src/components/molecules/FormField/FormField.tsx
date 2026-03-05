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
import type { FormFieldProps } from './FormField.types';

export function FormField({ label, errorMessage, isRequired, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <LegatoText variant="label" color={Colors.textSecondaryLight} style={styles.label}>
        {label}{isRequired && ' *'}
      </LegatoText>
      <Input hasError={!!errorMessage} style={style} {...inputProps} />
      {errorMessage && (
        <LegatoText style={styles.error}>{errorMessage}</LegatoText>
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
});
