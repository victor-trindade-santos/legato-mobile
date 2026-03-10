/**
 * MusicianCard — Molecule
 * Card de músico para a tela de Descoberta.
 *
 * Quando isTop=true: ativa PanGesture (swipe) via Gesture Handler v2 + Reanimated v3.
 * Quando isTop=false: renderiza estático (card de fundo no stack).
 *
 * Exibe: foto, indicadores de carrossel, badge de distância,
 *        nome/idade, tags de skill, CTA, overlays de like/dislike.
 */

import React from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
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
import { formatDistance } from '@/utils/formatters';
import type { MusicianCardProps } from './MusicianCard.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

export function MusicianCard({ musician, isTop, onSwipeLeft, onSwipeRight }: MusicianCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const gesture = Gesture.Pan()
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
      if (e.translationX > SWIPE_THRESHOLD) {
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

  const cardContent = (
    <View style={styles.card}>
      {/* Foto de fundo */}
      {musician.avatarUrl ? (
        <ImageBackground
          source={{ uri: musician.avatarUrl }}
          style={StyleSheet.absoluteFill}
          imageStyle={{ borderRadius: BorderRadius.xl }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]}>
          <Avatar uri={null} size="xl" fallbackInitials={musician.displayName} />
        </View>
      )}

      {/* Indicadores de carrossel */}
      <View style={styles.indicators}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.indicator, i === 0 && styles.indicatorActive]} />
        ))}
      </View>

      {/* Badge de distância */}
      <View style={styles.distanceBadge}>
        <LegatoText style={styles.distanceText}>{formatDistance(musician.distance)}</LegatoText>
      </View>

      {/* Gradiente + info (rodapé) */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.90)']}
        style={styles.gradient}
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

      {/* Overlay MATCH (swipe direita) */}
      <Animated.View style={[styles.overlayLike, likeOverlayStyle]} pointerEvents="none">
        <LegatoText style={styles.overlayLikeLabel}>MATCH</LegatoText>
      </Animated.View>

      {/* Overlay PASSA (swipe esquerda) */}
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
    backgroundColor: Colors.surfaceDark,
  },
  fallbackBg: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.xl,
  },
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
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  name: {
    marginBottom: Spacing.xxs,
  },
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
