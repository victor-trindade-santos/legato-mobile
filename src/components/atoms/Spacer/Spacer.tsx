import React from 'react';
import { View } from 'react-native';
import type { SpacerProps } from './Spacer.types';

export function Spacer({ size = 8, horizontal = false }: SpacerProps) {
  return (
    <View
      style={
        horizontal
          ? { width: size }
          : { height: size }
      }
    />
  );
}