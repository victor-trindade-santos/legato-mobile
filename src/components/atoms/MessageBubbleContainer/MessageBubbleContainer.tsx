/**
 * MessageBubbleContainer — Atom
 *
 * Casca visual da mensagem.
 *
 * Responsável por:
 *  - fundo do bubble
 *  - border radius
 *  - padding interno
 *  - largura máxima
 *
 * NÃO sabe:
 *  - alinhamento (esquerda/direita)
 *  - quem enviou
 *  - status
 *  - horário
 *
 * Template visual:
 *
 *  ┌──────────────────────┐
 *  │  conteúdo aqui       │
 *  └──────────────────────┘
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/theme';

import type { MessageBubbleContainerProps } from './MessageBubbleContainer.types';

export function MessageBubbleContainer({
  children,
  backgroundColor,
  style,
}: MessageBubbleContainerProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '78%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
});