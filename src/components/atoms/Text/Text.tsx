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
import { Text } from 'react-native';
import { TextStyles } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { LegatoTextProps } from './Text.types';

export function LegatoText({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...rest
}: LegatoTextProps) {
  const colors = useColors();

  return (
    <Text
      style={[
        TextStyles[variant],
        { color: color ?? colors.textPrimary, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
