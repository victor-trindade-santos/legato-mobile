/**
 * MessageContent — Molecule
 *
 * Miolo da mensagem.
 * Responsável apenas por exibir:
 *  - Texto da mensagem
 *  - Horário
 *  - (opcional) status de envio/leitura
 *
 * NÃO sabe:
 *  - se a mensagem é minha ou do outro
 *  - alinhamento
 *  - cor do bubble
 *  - nada sobre chat
 *
 * Template visual esperado:
 *
 *  Oi, você já viu isso?
 *
 *  14:32   ✓✓
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { LegatoText } from '@/components/atoms/Text/Text';
import { TimestampText } from '@/components/atoms/TimestampText/TimestampText';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { MessageContentProps } from './MessageContent.types';

export function MessageContent({
  message,
  timestamp,
  statusElement,
}: MessageContentProps) {
  return (
    <View style={styles.container}>
      {/* Texto da mensagem */}
      <LegatoText variant="body" color={Colors.textPrimaryDark}>
        {message}
      </LegatoText>

      <Spacer size={Spacing.xs} />

      {/* Linha inferior: horário + status */}
      <View style={styles.footerRow}>
        <TimestampText>{timestamp}</TimestampText>

        {/* {statusElement && (
          <>
            <Spacer horizontal size={6} />
            {statusElement}
          </>
        )} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});