/**
 * Button — Atom
 *
 * Variantes: primary (roxo sólido), secondary (cinza), outline (borda roxa),
 *            ghost (sem fundo), danger (vermelho).
 * Tamanhos: sm | md | lg
 *
 * USO:
 *   <Button label="Cadastre-se" variant="primary" size="lg" fullWidth />
 *   <Button label="Fazer Login" variant="outline" size="lg" fullWidth />
 */

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { LegatoText } from '../Text/Text';
import type { ButtonProps } from './Button.types';

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  borderRadius = BorderRadius.lg,
  style,
  containerStyle,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        { borderRadius },
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary}
        />
      ) : (
        <View style={[styles.content, containerStyle]}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <LegatoText
            variant={size === 'sm' ? 'buttonSm' : size === 'lg' ? 'buttonLg' : 'buttonMd'}
            color={
              variant === 'primary' || variant === 'danger'
                ? Colors.white
                : variant === 'outline' || variant === 'ghost' || variant === 'outline_gray'
                ? Colors.grayBorder
                : Colors.textPrimaryDark
            }
          >
            {label}
          </LegatoText>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: Spacing.xs },
  iconRight: { marginLeft: Spacing.xs },

  // Variantes
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surfaceDark,
  },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  outline_gray: {
    backgroundColor: Colors.transparent,
    borderWidth: 2,
    borderColor: Colors.grayBorder,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // Tamanhos
  sm: {
    height: Spacing.buttonHeightSm,
    paddingHorizontal: Spacing.md,
  },
  md: {
    height: Spacing.buttonHeightMd,
    paddingHorizontal: Spacing.lg,
  },
  lg: {
    height: Spacing.buttonHeightLg,
    paddingHorizontal: Spacing.xl,
  },

  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
});
