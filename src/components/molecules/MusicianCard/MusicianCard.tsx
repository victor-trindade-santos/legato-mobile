/**
 * MusicianCard — Molecule
 *
 * Quando isTop=true: ativa PanGesture (swipe like/dislike) via GH v2 + Reanimated v3.
 * Quando isTop=false: renderiza estático (card de fundo no stack).
 *
 * Carrossel de fotos:
 *  - Até 4 fotos (photos[] do model, com fallback para avatarUrl)
 *  - Toque na metade ESQUERDA → foto anterior
 *  - Toque na metade DIREITA  → próxima foto
 *  - Indicadores de barra no topo refletem o índice atual
 *  - .minDistance(10) no PanGesture evita conflito com os toques de navegação
 *
 * Swipe para baixo:
 *  - translationY > SWIPE_DOWN_THRESHOLD E movimento mais vertical que horizontal
 *  - Anima o card para fora e chama onSwipeDown (navega para MusicianProfile modal)
 */

import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { formatDistance } from '@/utils/formatters';
import type { MusicianCardProps } from './MusicianCard.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const SWIPE_DOWN_THRESHOLD = SCREEN_HEIGHT * 0.18;
const MAX_PHOTOS = 4;

export function MusicianCard({ musician, isTop, onSwipeLeft, onSwipeRight, onSwipeDown }: MusicianCardProps) {
  // ── Carrossel ─────────────────────────────────────────────────────────
  const colors = useColors();
  const photos = (musician.photos?.slice(0, MAX_PHOTOS) ?? []).filter(Boolean);
  if (musician.avatarUrl && !photos.includes(musician.avatarUrl)) {
    photos.unshift(musician.avatarUrl);
  }
  const photoList = photos.slice(0, MAX_PHOTOS);
  const totalPhotos = photoList.length;

  const [photoIndex, setPhotoIndex] = useState(0);
  const goNext = () => setPhotoIndex(i => Math.min(i + 1, totalPhotos - 1));
  const goPrev = () => setPhotoIndex(i => Math.max(i - 1, 0));

  // ── Swipe (like / dislike) ────────────────────────────────────────────
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const gesture = Gesture.Pan()
    .minDistance(10)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotate.value = interpolate(
        e.translationX,
        [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
        [-15, 15],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((e) => {
      const isDown =
        e.translationY > SWIPE_DOWN_THRESHOLD &&
        Math.abs(e.translationY) > Math.abs(e.translationX);

      if (isDown) {
        // Swipe-down é "ver mais", não descartar — reseta o card e navega
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        if (onSwipeDown) runOnJS(onSwipeDown)();
      } else if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
          if (onSwipeRight) runOnJS(onSwipeRight)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
          if (onSwipeLeft) runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const dislikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const currentPhoto = photoList[photoIndex];

  // ── Render ────────────────────────────────────────────────────────────
  const cardContent = (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Foto de fundo */}
      {currentPhoto ? (
        <ImageBackground
          source={{ uri: currentPhoto }}
          style={StyleSheet.absoluteFill}
          imageStyle={{ borderRadius: BorderRadius.xl }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg, { backgroundColor: colors.surface }]}>
          <Avatar uri={null} size="xl" fallbackInitials={musician.displayName} />
        </View>
      )}

      {/* Zonas de toque (navegação de fotos) — só quando há mais de 1 */}
      {totalPhotos > 1 && (
        <>
          <TouchableOpacity style={styles.tapLeft}  activeOpacity={1} onPress={goPrev} />
          <TouchableOpacity style={styles.tapRight} activeOpacity={1} onPress={goNext} />
        </>
      )}

      {/* Indicadores */}
      <View style={styles.indicators}>
        {photoList.map((_, i) => (
          <View key={i} style={[styles.indicator, i === photoIndex && styles.indicatorActive]} />
        ))}
      </View>

      {/* Badge de distância */}
      <View style={styles.distanceBadge}>
        <LegatoText style={styles.distanceText}>{formatDistance(musician.distance)}</LegatoText>
      </View>

      {/* Gradiente + info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.90)']}
        style={styles.gradient}
        pointerEvents="none"
      >
        <LegatoText variant="subtitle" color={Colors.white} style={styles.name}>
          {musician.displayName} - {musician.age}
        </LegatoText>
        <View style={styles.tags}>
          {musician.skills.slice(0, 3).map((skill) => (
            <Tag key={skill} label={skill} color={Colors.primary} />
          ))}
        </View>
        <LegatoText style={styles.cta}>
          Role para baixo e veja mais informações
        </LegatoText>
      </LinearGradient>

      {/* Overlay MATCH */}
      <Animated.View style={[styles.overlayLike, likeOverlayStyle]} pointerEvents="none">
        <LegatoText style={styles.overlayLikeLabel}>MATCH</LegatoText>
      </Animated.View>

      {/* Overlay PASSA */}
      <Animated.View style={[styles.overlayDislike, dislikeOverlayStyle]} pointerEvents="none">
        <LegatoText style={styles.overlayDislikeLabel}>PASSA</LegatoText>
      </Animated.View>
    </View>
  );

  if (!isTop) {
    return <View style={StyleSheet.absoluteFill}>{cardContent}</View>;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        {cardContent}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  fallbackBg: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },

  // Zonas de toque para navegação de foto
  tapLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '45%',
    height: '75%',
    zIndex: 5,
  },
  tapRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '45%',
    height: '75%',
    zIndex: 5,
  },

  // Indicadores de carrossel
  indicators: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
    zIndex: 10,
  },
  indicator: {
    flex: 1,
    height: 3,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  indicatorActive: {
    backgroundColor: Colors.white,
  },

  // Badge de distância
  distanceBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    zIndex: 10,
  },
  distanceText: {
    color: Colors.white,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.semiBold,
  },

  // Gradiente rodapé
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
    zIndex: 6,
  },
  name: { marginBottom: Spacing.xxs },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  cta: {
    color: Colors.textSubtext,
    fontSize: Typography.FontSize.xxs,
    fontStyle: 'italic',
  },

  // Swipe overlays
  overlayLike: {
    position: 'absolute',
    top: Spacing.xxl,
    left: Spacing.lg,
    borderWidth: 3,
    borderColor: Colors.swipeLike,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    transform: [{ rotate: '-15deg' }],
    zIndex: 20,
  },
  overlayLikeLabel: {
    color: Colors.swipeLike,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  overlayDislike: {
    position: 'absolute',
    top: Spacing.xxl,
    right: Spacing.lg,
    borderWidth: 3,
    borderColor: Colors.swipeDislike,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    transform: [{ rotate: '15deg' }],
    zIndex: 20,
  },
  overlayDislikeLabel: {
    color: Colors.swipeDislike,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
