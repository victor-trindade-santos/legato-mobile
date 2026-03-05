/**
 * LegatoText — Atom
 *
 * Componente de texto com variantes tipográficas do Design System.
 * Encapsula as regras de tipografia para garantir consistência.
 *
 * USO:
 *   <LegatoText variant="title">Legato</LegatoText>
 *   <LegatoText variant="caption" color={Colors.textMuted}>2 min atrás</LegatoText>
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TextStyles, Colors } from '@/theme';
import type { LegatoTextProps } from './Text.types';

export function LegatoText({
  variant = 'body',
  color = Colors.textPrimaryDark,
  align = 'left',
  style,
  children,
  ...rest
}: LegatoTextProps) {
  return (
    <Text
      style={[
        TextStyles[variant],
        { color, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
