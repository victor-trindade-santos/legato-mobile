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
 * Card unificado:
 *  - Todo o conteúdo fica dentro do mesmo card animado
 *  - Swipe lateral funciona em qualquer área do card
 *  - Scroll vertical revela o perfil completo sem separar o layout
 */

import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
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
import { MusicianCardProfileSection } from './MusicianCardProfileSection';
import type { MusicianCardProps, MusicianCardData } from './MusicianCard.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.24;
const FLICK_VELOCITY_THRESHOLD = 700;
const MAX_PHOTOS = 4;

/**
 * Hook para carregar o perfil completo de um músico sob demanda
 */
function useLazyMusicianProfile(musician: MusicianCardData) {
  // Cria perfil mockado automaticamente a partir dos dados do músico
  const mockProfile = React.useMemo(() => {
    if (!musician) return null;
    
    // Gera artistas favoritos mockados baseado no ID
    const favoriteArtists = [
      { id: musician.id + 100, displayName: 'John Lennon', username: 'john_lennon', avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: musician.id + 101, displayName: 'David Bowie', username: 'david_bowie', avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
      { id: musician.id + 102, displayName: 'Prince', username: 'prince', avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
      { id: musician.id + 103, displayName: 'Amy Winehouse', username: 'amy_winehouse', avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg' },
    ];

    return {
      username: musician.username || 'usuario',
      bio: musician.bio || 'Músico apaixonado por criar conexões.',
      objective: 'Buscar colaborações e novas oportunidades musicais',
      skills: musician.skills || [],
      musicGenres: musician.musicGenres || [],
      stats: {
        connections: Math.floor(Math.random() * 100) + 10,
        followers: Math.floor(Math.random() * 500) + 50,
        posts: Math.floor(Math.random() * 30) + 5,
      },
      favoriteArtists,
    };
  }, [musician]);

  return mockProfile;
}

export function MusicianCard({ musician, isTop, onSwipeLeft, onSwipeRight, profile }: MusicianCardProps) {
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

  // ── Perfil mockado ────────────────────────────────────────────────────
  const mockProfile = useLazyMusicianProfile(musician);
  const displayProfile = profile || mockProfile;

  // ── Animação: apenas movimento horizontal ────────────────────────────
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  // ── Gestos ────────────────────────────────────────────────────────────
  const swipeGesture = Gesture.Pan()
    .minDistance(6)
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const isHorizontalMovement = Math.abs(e.translationX) > Math.abs(e.translationY);
      
      if (isHorizontalMovement) {
        translateX.value = e.translationX;
        rotate.value = interpolate(
          e.translationX,
          [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
          [-15, 15],
          Extrapolation.CLAMP,
        );
      }
    })
    .onEnd((e) => {
      const hasDistanceSwipe = Math.abs(e.translationX) > SWIPE_THRESHOLD;
      const hasFlickSwipe = Math.abs(e.velocityX) > FLICK_VELOCITY_THRESHOLD;
      const isHorizontalIntent = Math.abs(e.translationX) > Math.abs(e.translationY) * 0.8;
      const isHorizontalSwipe = isHorizontalIntent && (hasDistanceSwipe || hasFlickSwipe);

      if (isHorizontalSwipe) {
        if (e.translationX > 0 || e.velocityX > FLICK_VELOCITY_THRESHOLD) {
          translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
            if (onSwipeRight) runOnJS(onSwipeRight)();
          });
        } else {
          translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
            if (onSwipeLeft) runOnJS(onSwipeLeft)();
          });
        }
      } else {
        // Reset apenas X e rotate
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const gesture = Gesture.Simultaneous(swipeGesture, Gesture.Native());

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
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
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: colors.surface }]}
      scrollEnabled
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Foto + Gradiente ─────────────────────────────────────────────── */}
      <View style={[styles.bannerSection, { backgroundColor: colors.surface }]}>
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

      {/* Seção de perfil — sempre visível com scroll ────────────────── */}
      {displayProfile && (
        <MusicianCardProfileSection musician={musician} profile={displayProfile} />
      )}
    </ScrollView>
  );

  const cardStyle = [styles.cardContainer, isTop && animatedStyle];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={cardStyle}>{cardContent}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },

  scrollContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },

  scrollContent: {
    paddingBottom: Spacing.md,
  },

  bannerSection: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.45,
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
