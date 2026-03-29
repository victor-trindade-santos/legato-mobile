import React from 'react';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors } from '@/theme';
import type { TimestampTextProps } from './TimestampText.types';

export function TimestampText({
  color = Colors.textMuted,
  align = 'right',
  style,
  children,
  ...rest
}: TimestampTextProps) {
  return (
    <LegatoText
      variant="caption"
      color={color}
      align={align}
      style={style}
      {...rest}
    >
      {children}
    </LegatoText>
  );
}