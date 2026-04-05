/**
 * MyMessageBubble — Molecule
 *
 * Representa a mensagem enviada pelo usuário atual.
 *
 * Responsável por:
 *  - alinhamento à direita
 *  - cor do bubble de mensagem enviada
 *  - usar o MessageBubbleContainer (atom)
 *  - receber o conteúdo da mensagem
 *
 * Template visual:
 *
 *                         ┌──────────────────────┐
 *                         │  MessageContent      │
 *                         └──────────────────────┘
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { MessageBubbleContainer } from '@/components/atoms/MessageBubbleContainer/MessageBubbleContainer';
import type { MyMessageBubbleProps } from './MyMessageBubble.types';

export function MyMessageBubble({ children }: MyMessageBubbleProps) {
  return (
    <View style={styles.wrapper}>
      <MessageBubbleContainer backgroundColor={Colors.primary}>
        {children}
      </MessageBubbleContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    marginVertical: Spacing.xs,
  },
});