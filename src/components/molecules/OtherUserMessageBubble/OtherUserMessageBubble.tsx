/**
 * OtherUserMessageBubble — Molecule
 *
 * Representa a mensagem recebida de outro usuário na conversa.
 *
 * Propósito dessa molecule:
 *  - alinhar a mensagem à esquerda
 *  - aplicar a cor de bubble de mensagem recebida
 *  - reutilizar o MessageBubbleContainer (atom)
 *  - manter a separação clara entre:
 *      "mensagem minha" vs "mensagem de outro"
 *
 * Essa distinção é CRÍTICA em apps de chat,
 * porque a leitura do usuário depende quase 100%
 * dessa diferenciação visual.
 *
 * Template visual:
 *
 *  ┌──────────────────────┐
 *  │  MessageContent      │
 *  └──────────────────────┘
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { MessageBubbleContainer } from '@/components/atoms/MessageBubbleContainer/MessageBubbleContainer';
import type { OtherUserMessageBubbleProps } from './OtherUserMessageBubble.types';

export function OtherUserMessageBubble({ children }: OtherUserMessageBubbleProps) {
  return (
    <View style={styles.wrapper}>
      <MessageBubbleContainer backgroundColor={Colors.primaryLight}>
        {children}
      </MessageBubbleContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    marginVertical: Spacing.xs,
  },
});