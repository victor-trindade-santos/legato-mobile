/**
 * SwipeOverlay — Molecule
 * Overlay de "LIKE" / "NOPE" que aparece ao arrastar o card.
 * Recebe a direção e uma opacidade animada.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, BorderRadius, Spacing } from '@/theme';

interface SwipeOverlayProps {
  direction: 'left' | 'right';
  opacity: Animated.SharedValue<number>;
}

export function SwipeOverlay({ direction, opacity }: SwipeOverlayProps) {
  const isRight = direction === 'right';

  return (
    <Animated.View
      style={[
        styles.overlay,
        isRight ? styles.right : styles.left,
        { opacity },
      ]}
    >
      <LegatoText style={[styles.label, { color: isRight ? Colors.swipeLike : Colors.swipeDislike }]}>
        {isRight ? '💚 MATCH' : '✕ PASSA'}
      </LegatoText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Spacing.xl,
    borderWidth: 3,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  right: {
    left: Spacing.lg,
    borderColor: Colors.swipeLike,
    transform: [{ rotate: '-15deg' }],
  },
  left: {
    right: Spacing.lg,
    borderColor: Colors.swipeDislike,
    transform: [{ rotate: '15deg' }],
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
