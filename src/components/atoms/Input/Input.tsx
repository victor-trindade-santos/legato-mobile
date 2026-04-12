/**
 * Input — Atom
 *
 * Campo de texto base com estados: default, focado, erro.
 * Borda roxa ao focar (igual ao projeto web: border-color #6b46c1).
 *
 * Props:
 *  - variant "light" (padrão): fundo branco — telas de auth
 *  - variant "dark": fundo escuro — telas do app principal
 *  - multiline: expande verticalmente (bio, descrições)
 *
 * USO:
 *   <Input placeholder="Digite seu e-mail" hasError={!!error} />
 *   <Input variant="dark" multiline numberOfLines={4} />
 */

import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import type { InputProps } from './Input.types';

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

type InputThemeOverride = {
  background?: string;
  border?: string;
  text?: string;
}

export function Input({
  hasError = false,
  isPassword = false,
  variant,
  multiline = false,
  themeOverride,
  numberOfLines,
  style,
  containerStyle,
  inputStyle,
  ...rest
}: InputProps & { themeOverride?: InputThemeOverride }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const storeTheme = useUIStore((s) => s.theme);
  const resolvedVariant = variant ?? (storeTheme === 'dark' ? 'dark' : 'light');
  const baseTheme = THEME[resolvedVariant];

  const theme = {
    background: themeOverride?.background || baseTheme.background,
    border: themeOverride?.border || baseTheme.border,
    text: themeOverride?.text || baseTheme.text,
  };

  return (
    <View
      style={[

        styles.container,
        containerStyle,
        { backgroundColor: theme.background, borderColor: theme.border },
        multiline && styles.containerMultiline,
        isFocused && styles.focused,
        hasError && styles.error,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          { color: theme.text },
          multiline && styles.inputMultiline,
          { outline: 'none' } as any,
          style,
        ]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={Colors.textMuted}
        underlineColorAndroid="transparent"
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
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.inputPaddingH,
    height: Spacing.buttonHeightMd,
  },
  containerMultiline: {
    height: 'auto',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
    paddingVertical: Spacing.sm,
  },
  inputMultiline: {
    height: undefined,
    textAlignVertical: 'top',
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
