/**
 * TypingIndicator — Molecule
 *
 * Representa o estado temporário de "usuário digitando".
 *
 * Responsável por:
 *  - exibir o nome do usuário
 *  - exibir os 3 pontinhos animados
 *
 * NÃO sabe:
 *  - mensagens
 *  - alinhamento de bubble
 *
 * Template visual:
 *
 *  João está digitando...
 *  ●  ●  ●
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { StatusDot } from '@/components/atoms/StatusDot/StatusDot';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { TypingIndicatorProps } from './TypingIndicator.types';

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

    animate(opacity1, 0);
    animate(opacity2, 200);
    animate(opacity3, 400);
  }, []);

  return (
    <View style={styles.container}>
      <LegatoText variant="caption" color={Colors.textMuted}>
        {userName} está digitando...
      </LegatoText>

      <Spacer size={Spacing.xs} />

      <View style={styles.dots}>
        <Animated.View style={{ opacity: opacity1 }}>
          <StatusDot size={8} variant="online" />
        </Animated.View>
        <Spacer horizontal size={Spacing.xs} />
        <Animated.View style={{ opacity: opacity2 }}>
          <StatusDot size={8} variant="online" />
        </Animated.View>
        <Spacer horizontal size={Spacing.xs} />
        <Animated.View style={{ opacity: opacity3 }}>
          <StatusDot size={8} variant="online" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});