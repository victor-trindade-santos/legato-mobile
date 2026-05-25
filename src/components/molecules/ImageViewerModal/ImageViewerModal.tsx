/**
 * ImageViewerModal — Molecule
 *
 * Visualizador de imagem em tela cheia, estilo WhatsApp.
 *
 * Gestos suportados:
 *  - Pinch      → zoom in/out (1x – 5x)
 *  - Pan        → move a imagem quando zoom > 1; swipe vertical fecha quando zoom = 1
 *  - Double tap → alterna entre 1x e 2.5x
 */

import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/theme';
import { LegatoText } from '@/components/atoms/Text/Text';
import { TimestampText } from '@/components/atoms/TimestampText/TimestampText';
import type { ImageViewerModalProps } from './ImageViewerModal.types';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');
const MAX_SCALE = 5;
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;
const HEADER_TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 8;

const smooth = (duration = 220) =>
  ({ duration, easing: Easing.out(Easing.quad) } as const);

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export function ImageViewerModal({
  visible,
  imageUrl,
  senderName,
  timestamp,
  onClose,
}: ImageViewerModalProps) {
  // ── Shared values ──────────────────────────────────────────────────────────
  const scale = useSharedValue(0.9);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);

  // ── Animação de entrada ────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    scale.value = 0.9;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    backdropOpacity.value = 0;
    headerOpacity.value = 0;

    backdropOpacity.value = withTiming(1, smooth(180));
    scale.value = withTiming(1, smooth(220));
    headerOpacity.value = withTiming(1, smooth(220));
  }, [visible]);

  // ── Fechar ─────────────────────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    // 1ª etapa: imagem desliza para fora
    translateY.value = withTiming(SCREEN_H, smooth(260), () => {
      // 2ª etapa: bg + header somem juntos
      backdropOpacity.value = withTiming(0, smooth(180), () => onClose());
      headerOpacity.value = withTiming(0, smooth(180));
    });
  }, [onClose]);

  // ── Gestos ─────────────────────────────────────────────────────────────────

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(1, savedScale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1, smooth());
        translateX.value = withTiming(0, smooth());
        translateY.value = withTiming(0, smooth());
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1.05) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        translateY.value = e.translationY;
        backdropOpacity.value = Math.min(
          1,
          Math.max(0, 1 - Math.abs(e.translationY) / 350)
        );
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1.05) {
        const shouldClose =
          Math.abs(e.translationY) > CLOSE_DISTANCE ||
          Math.abs(e.velocityY) > CLOSE_VELOCITY;

        if (shouldClose) {
          const dir = e.translationY >= 0 ? 1 : -1;
          // 1ª etapa: imagem termina de sair
          translateY.value = withTiming(dir * SCREEN_H, smooth(220), () => {
            // 2ª etapa: bg + header somem juntos
            backdropOpacity.value = withTiming(0, smooth(180), () => onClose());
            headerOpacity.value = withTiming(0, smooth(180));
          });
        } else {
          translateY.value = withTiming(0, smooth(250));
          backdropOpacity.value = withTiming(1, smooth(200));
        }
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      if (!success) return;
      if (scale.value > 1) {
        scale.value = withTiming(1, smooth(250));
        savedScale.value = 1;
        translateX.value = withTiming(0, smooth(250));
        translateY.value = withTiming(0, smooth(250));
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2.5, smooth(250));
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, panGesture),
    pinchGesture
  );

  // ── Estilos animados ───────────────────────────────────────────────────────

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View style={styles.root}>
        {/* ── Background (opacity anima no swipe — isolado do header) ─ */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.bg, backdropStyle]} />

        {/* ── Imagem (área de gestos) ──────────────────────────────── */}
        <GestureDetector gesture={composed}>
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[styles.image, imageStyle]}
            resizeMode="contain"
          />
        </GestureDetector>

        {/* ── Cabeçalho (fixo — não herda nenhum transform nem opacity) */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerInfo}>
            <LegatoText variant="bodyMedium" color={Colors.white}>
              {senderName}
            </LegatoText>
            <TimestampText color={Colors.textSubtext} align="left">
              {timestamp}
            </TimestampText>
          </View>

          <TouchableOpacity
            onPress={closeModal}
            hitSlop={12}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bg: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  header: {
    position: 'absolute',
    top: HEADER_TOP,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
});
