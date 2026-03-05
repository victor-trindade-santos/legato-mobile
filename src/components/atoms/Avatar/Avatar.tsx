/**
 * Avatar — Atom
 * Foto de perfil circular com fallback para iniciais.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/theme';
import { LegatoText } from '../Text/Text';
import type { AvatarProps } from './Avatar.types';

const SIZE_MAP = {
  sm: Spacing.avatarSm,
  md: Spacing.avatarMd,
  lg: Spacing.avatarLg,
  xl: Spacing.avatarXl,
};

export function Avatar({ uri, size = 'md', fallbackInitials = '?' }: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = dimension / 2.5;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      <LegatoText style={{ fontSize, color: Colors.white, fontWeight: '700' }}>
        {fallbackInitials.slice(0, 2).toUpperCase()}
      </LegatoText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
