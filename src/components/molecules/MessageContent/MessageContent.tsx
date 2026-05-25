/**
 * MessageContent — Molecule
 *
 * Miolo da mensagem.
 * Responsável por exibir:
 *  - Texto da mensagem (typeMedia = NONE ou ausente)
 *  - Imagem (typeMedia = IMAGE)
 *  - Vídeo (typeMedia = VIDEO) — placeholder com ícone de play
 *  - Áudio (typeMedia = AUDIO) — linha com ícone de microfone
 *  - Horário
 *  - (opcional) status de envio/leitura
 */

import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { LegatoText } from '@/components/atoms/Text/Text';
import { TimestampText } from '@/components/atoms/TimestampText/TimestampText';
import { Spacer } from '@/components/atoms/Spacer/Spacer';
import { Icon } from '@/components/atoms/Icon/Icon';

import type { MessageContentProps } from './MessageContent.types';

export function MessageContent({
  message,
  timestamp,
  typeMedia,
  mediaUrl,
  onImagePress,
  onVideoPress,
  statusElement,
}: MessageContentProps) {
  const isImage = typeMedia === 'IMAGE';
  const isVideo = typeMedia === 'VIDEO';
  const isAudio = typeMedia === 'AUDIO';
  const isMedia = isImage || isVideo || isAudio;

  return (
    <View style={styles.container}>

      {isImage && mediaUrl && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onImagePress?.(mediaUrl)}
          disabled={!onImagePress}
        >
          <Image
            source={{ uri: mediaUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {isVideo && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => mediaUrl && onVideoPress?.(mediaUrl)}
          disabled={!onVideoPress || !mediaUrl}
        >
          <View style={styles.videoPlaceholder}>
            <Icon
              variant="vector"
              family="Ionicons"
              name="play-circle"
              size={48}
              color={Colors.white}
            />
          </View>
        </TouchableOpacity>
      )}

      {isAudio && (
        <View style={styles.audioRow}>
          <Icon
            variant="vector"
            family="Ionicons"
            name="mic"
            size={18}
            color={Colors.textPrimaryDark}
          />
          <Spacer horizontal size={Spacing.xs} />
          <LegatoText variant="body" color={Colors.textPrimaryDark}>
            Mensagem de voz
          </LegatoText>
        </View>
      )}

      {!isMedia && (
        <LegatoText variant="body" color={Colors.textPrimaryDark}>
          {message}
        </LegatoText>
      )}

      {isMedia && <Spacer size={Spacing.xs} />}
      {!isMedia && <Spacer size={Spacing.xs} />}

      <View style={styles.footerRow}>
        <TimestampText>{timestamp}</TimestampText>

        {statusElement && (
          <>
            <Spacer horizontal size={6} />
            {statusElement}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '100%',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});
