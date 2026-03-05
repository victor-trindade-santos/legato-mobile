/**
 * MusicianCard — Molecule
 * Card de músico para a tela de Descoberta.
 * Exibe foto, nome, distância, skills, gêneros.
 *
 * O componente é estático — a lógica de swipe (Gesture Handler + Reanimated)
 * fica no organismo DiscoveryStack.
 */

import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { formatDistance } from '@/utils/formatters';
import type { MusicianCardProps } from './MusicianCard.types';

export function MusicianCard({ musician }: MusicianCardProps) {
  return (
    <View style={styles.card}>
      {musician.avatarUrl ? (
        <ImageBackground
          source={{ uri: musician.avatarUrl }}
          style={styles.image}
          imageStyle={{ borderRadius: BorderRadius.xl }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.gradient}
          >
            <View style={styles.info}>
              <LegatoText variant="subtitle" color={Colors.white}>
                {musician.displayName}, {musician.age}
              </LegatoText>
              <LegatoText variant="caption" color={Colors.textSubtext} style={styles.distance}>
                📍 {formatDistance(musician.distance)}
              </LegatoText>
              <View style={styles.tags}>
                {musician.skills.slice(0, 3).map((skill) => (
                  <Tag key={skill} label={skill} color={Colors.primary} />
                ))}
                {musician.musicGenres.slice(0, 2).map((genre) => (
                  <Tag key={genre} label={genre} variant="outline" color={Colors.white} />
                ))}
              </View>
              {musician.bio && (
                <LegatoText variant="bodySmall" color={Colors.textSubtext} style={styles.bio}>
                  {musician.bio}
                </LegatoText>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <View style={[styles.image, styles.fallbackBg]}>
          <Avatar uri={null} size="xl" fallbackInitials={musician.displayName} />
          <View style={styles.info}>
            <LegatoText variant="subtitle" color={Colors.white}>
              {musician.displayName}, {musician.age}
            </LegatoText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceDark,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fallbackBg: {
    backgroundColor: Colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  info: {
    gap: Spacing.xs,
  },
  distance: {
    marginBottom: Spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  bio: {
    marginTop: Spacing.xs,
    opacity: 0.85,
  },
});
