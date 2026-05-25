/**
 * MessageContent — Molecule
 *
 * Miolo da mensagem.
 * Responsável por exibir:
 *  - Texto da mensagem (typeMedia = NONE ou ausente)
 *  - Imagem (typeMedia = IMAGE)
 *  - Vídeo (typeMedia = VIDEO) — thumbnail do primeiro frame + ícone de play
 *  - Áudio (typeMedia = AUDIO) — linha com ícone de microfone
 *  - Horário
 *  - (opcional) status de envio/leitura
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing } from '@/theme';

import { LegatoText } from '@/components/atoms/Text/Text';
import { TimestampText } from '@/components/atoms/TimestampText/TimestampText';
import { Spacer } from '@/components/atoms/Spacer/Spacer';
import { Icon } from '@/components/atoms/Icon/Icon';

import type { MessageContentProps } from './MessageContent.types';

const MEDIA_WIDTH = 220;
const MIN_RATIO = 0.5;
const MAX_RATIO = 2;

export function MessageContent({
  message,
  timestamp,
  typeMedia,
  mediaUrl,
  onImagePress,
  onVideoPress,
  statusElement,
  mediaWidth,
  mediaHeight,
}: MessageContentProps) {
  const isImage = typeMedia === 'IMAGE';
  const isVideo = typeMedia === 'VIDEO';
  const isAudio = typeMedia === 'AUDIO';
  const isMedia = isImage || isVideo || isAudio;

  // useVideoPlayer must be called unconditionally — pass null when not a video
  const videoPlayer = useVideoPlayer(
    isVideo && mediaUrl ? mediaUrl : null,
    () => { /* paused by default — shows first frame */ },
  );

  const [inferredRatio, setInferredRatio] = useState<number | null>(null);

  useEffect(() => {
    if (isImage && mediaUrl && !mediaWidth && !mediaHeight) {
      Image.getSize(
        mediaUrl,
        (w, h) => { if (w > 0 && h > 0) setInferredRatio(w / h); },
        () => {},
      );
    }
  }, [mediaUrl, isImage, mediaWidth, mediaHeight]);

  const aspectRatio = useMemo(() => {
    if (mediaWidth && mediaHeight) return mediaWidth / mediaHeight;
    if (inferredRatio) return inferredRatio;
    return 1;
  }, [mediaWidth, mediaHeight, inferredRatio]);

  const clampedRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, aspectRatio));
  const clampedVideoRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO,
    (mediaWidth && mediaHeight) ? mediaWidth / mediaHeight : 16 / 9,
  ));

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
            style={{
              width: MEDIA_WIDTH,
              aspectRatio: clampedRatio,
              borderRadius: 8,
            }}
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
          <View style={{
            width: MEDIA_WIDTH,
            aspectRatio: clampedVideoRatio,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: Colors.backgroundDark,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {mediaUrl && (
              <VideoView
                player={videoPlayer}
                style={StyleSheet.absoluteFillObject}
                nativeControls={false}
                contentFit="cover"
                pointerEvents="none"
              />
            )}
            <View style={styles.videoOverlay} />
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

      <Spacer size={Spacing.xs} />

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
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
