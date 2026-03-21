/**
 * Input — Atom
 *
 * Campo de texto base com estados: default, focado, erro.
 * Borda roxa ao focar (igual ao projeto web: border-color #6b46c1).
 *
 * USO:
 *   <Input placeholder="Digite seu e-mail" hasError={!!error} />
 */

import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '@/theme';
import type { InputProps } from './Input.types';

export function Input({
  hasError = false,
  isPassword = false,
  style,
  containerStyle,
  inputStyle,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        isFocused && styles.focused,
        hasError && styles.error,
      ]}
    >
      <TextInput
        style={[styles.input, inputStyle, style]}
        placeholderTextColor={Colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={isPassword && !showPassword}
        autoCapitalize={isPassword ? 'none' : rest.autoCapitalize}
        {...rest}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={Spacing.iconMd}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.inputPaddingH,
    height: Spacing.buttonHeightMd,
  },
  input: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
    color: Colors.textPrimaryLight,
    paddingVertical: 0,
  },
  focused: {
    borderColor: Colors.primary,
  },
  error: {
    borderColor: Colors.error,
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
});
